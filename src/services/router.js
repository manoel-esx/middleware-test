const axios = require('axios');
const { logger } = require('../utils/logger');
const externalSystemsConfig = require('../config/externalSystems');

class IntelligentRouter {
  constructor() {
    this.circuitBreakers = new Map();
    this.requestCounts = new Map();
    this.erpMappings = new Map(); // Novo: mapeamento ERP -> Sistema
  }

  /**
   * Configura o mapeamento de ERP para sistemas
   */
  configureErpMapping(erpId, systemId) {
    this.erpMappings.set(erpId.toString(), systemId);
    logger.info(`Mapeamento ERP configurado: ERP ${erpId} -> Sistema ${systemId}`);
  }

  /**
   * Remove mapeamento de ERP
   */
  removeErpMapping(erpId) {
    const removed = this.erpMappings.delete(erpId.toString());
    if (removed) {
      logger.info(`Mapeamento ERP removido: ERP ${erpId}`);
    }
    return removed;
  }

  /**
   * Obtém todos os mapeamentos ERP
   */
  getErpMappings() {
    return Object.fromEntries(this.erpMappings);
  }

  /**
   * Roteia uma requisição para o sistema mais apropriado
   */
  async routeRequest(endpoint, method, data, options = {}) {
    const {
      targetSystem = null,
      strategy = 'priority', // 'priority', 'round-robin', 'load-balance', 'failover'
      timeout = null,
      retry = true,
      erpId = null // Novo: ERP ID para roteamento automático
    } = options;

    try {
      // Prioridade 1: Sistema específico solicitado
      if (targetSystem) {
        return await this.routeToSpecificSystem(targetSystem, endpoint, method, data, timeout);
      }

      // Prioridade 2: Roteamento por ERP ID
      if (erpId && this.erpMappings.has(erpId.toString())) {
        const mappedSystem = this.erpMappings.get(erpId.toString());
        logger.info(`Roteando por ERP ID ${erpId} para sistema ${mappedSystem}`);
        return await this.routeToSpecificSystem(mappedSystem, endpoint, method, data, timeout);
      }

      // Prioridade 3: Estratégia de roteamento padrão
      switch (strategy) {
        case 'priority':
          return await this.routeByPriority(endpoint, method, data, timeout, retry);
        case 'round-robin':
          return await this.routeRoundRobin(endpoint, method, data, timeout, retry);
        case 'load-balance':
          return await this.routeLoadBalance(endpoint, method, data, timeout, retry);
        case 'failover':
          return await this.routeFailover(endpoint, method, data, timeout, retry);
        default:
          return await this.routeByPriority(endpoint, method, data, timeout, retry);
      }
    } catch (error) {
      logger.error('Erro no roteamento:', error);
      throw error;
    }
  }

  /**
   * Roteia para um sistema específico
   */
  async routeToSpecificSystem(systemId, endpoint, method, data, timeout) {
    const system = externalSystemsConfig.getSystem(systemId);
    if (!system || !system.enabled) {
      throw new Error(`Sistema ${systemId} não disponível ou desabilitado`);
    }

    if (this.isCircuitBreakerOpen(systemId)) {
      throw new Error(`Circuit breaker aberto para o sistema ${systemId}`);
    }

    return await this.makeRequest(system, endpoint, method, data, timeout);
  }

  /**
   * Roteamento por prioridade (padrão)
   */
  async routeByPriority(endpoint, method, data, timeout, retry) {
    const systems = externalSystemsConfig.getSystemByPriority();
    
    for (const system of systems) {
      try {
        if (this.isCircuitBreakerOpen(system.name)) {
          continue;
        }

        const result = await this.makeRequest(system, endpoint, method, data, timeout);
        this.recordSuccess(system.name);
        return result;
      } catch (error) {
        this.recordFailure(system.name);
        logger.warn(`Falha no sistema ${system.name}:`, error.message);
        
        if (retry && this.shouldRetry(system.name)) {
          continue;
        }
      }
    }

    throw new Error('Todos os sistemas estão indisponíveis');
  }

  /**
   * Roteamento round-robin
   */
  async routeRoundRobin(endpoint, method, data, timeout, retry) {
    const systems = externalSystemsConfig.getEnabledSystems();
    if (systems.length === 0) {
      throw new Error('Nenhum sistema disponível');
    }

    const currentIndex = this.getRoundRobinIndex();
    const system = systems[currentIndex % systems.length];

    try {
      if (this.isCircuitBreakerOpen(system.name)) {
        // Tenta o próximo sistema disponível
        for (let i = 1; i < systems.length; i++) {
          const nextSystem = systems[(currentIndex + i) % systems.length];
          if (!this.isCircuitBreakerOpen(nextSystem.name)) {
            return await this.makeRequest(nextSystem, endpoint, method, data, timeout);
          }
        }
        throw new Error('Todos os sistemas estão indisponíveis');
      }

      const result = await this.makeRequest(system, endpoint, method, data, timeout);
      this.recordSuccess(system.name);
      return result;
    } catch (error) {
      this.recordFailure(system.name);
      throw error;
    }
  }

  /**
   * Roteamento com balanceamento de carga
   */
  async routeLoadBalance(endpoint, method, data, timeout, retry) {
    const systems = externalSystemsConfig.getEnabledSystems();
    if (systems.length === 0) {
      throw new Error('Nenhum sistema disponível');
    }

    // Seleciona o sistema com menor carga (menos requisições)
    const system = systems.reduce((min, current) => {
      const minCount = this.requestCounts.get(min.name) || 0;
      const currentCount = this.requestCounts.get(current.name) || 0;
      return currentCount < minCount ? current : min;
    });

    try {
      if (this.isCircuitBreakerOpen(system.name)) {
        // Tenta outros sistemas disponíveis
        for (const otherSystem of systems) {
          if (otherSystem.name !== system.name && !this.isCircuitBreakerOpen(otherSystem.name)) {
            return await this.makeRequest(otherSystem, endpoint, method, data, timeout);
          }
        }
        throw new Error('Todos os sistemas estão indisponíveis');
      }

      this.incrementRequestCount(system.name);
      const result = await this.makeRequest(system, endpoint, method, data, timeout);
      this.recordSuccess(system.name);
      this.decrementRequestCount(system.name);
      return result;
    } catch (error) {
      this.recordFailure(system.name);
      this.decrementRequestCount(system.name);
      throw error;
    }
  }

  /**
   * Roteamento com failover
   */
  async routeFailover(endpoint, method, data, timeout, retry) {
    const systems = externalSystemsConfig.getSystemByPriority();
    
    for (const system of systems) {
      try {
        if (this.isCircuitBreakerOpen(system.name)) {
          continue;
        }

        const result = await this.makeRequest(system, endpoint, method, data, timeout);
        this.recordSuccess(system.name);
        return result;
      } catch (error) {
        this.recordFailure(system.name);
        logger.warn(`Falha no sistema ${system.name}, tentando próximo...`);
        continue;
      }
    }

    throw new Error('Todos os sistemas falharam');
  }

  /**
   * Faz a requisição HTTP para o sistema externo
   */
  async makeRequest(system, endpoint, method, data, timeout) {
    const url = `${system.baseUrl}${endpoint}`;
    const config = {
      method: method.toLowerCase(),
      url,
      timeout: timeout || system.timeout,
      headers: {
        'Authorization': `Bearer ${system.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'API-Middleware/1.0.0'
      }
    };

    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = data;
    }

    logger.info(`Fazendo requisição para ${system.name}:`, {
      method: config.method,
      url: config.url,
      system: system.name
    });

    const response = await axios(config);
    
    logger.info(`Resposta recebida de ${system.name}:`, {
      status: response.status,
      system: system.name
    });

    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
      system: system.name,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Circuit Breaker
   */
  isCircuitBreakerOpen(systemName) {
    const breaker = this.circuitBreakers.get(systemName);
    if (!breaker) return false;

    if (breaker.state === 'OPEN') {
      if (Date.now() - breaker.lastFailureTime > breaker.timeout) {
        breaker.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }

    return false;
  }

  recordSuccess(systemName) {
    const breaker = this.circuitBreakers.get(systemName) || {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      timeout: 60000
    };

    breaker.state = 'CLOSED';
    breaker.failureCount = 0;
    this.circuitBreakers.set(systemName, breaker);
  }

  recordFailure(systemName) {
    const system = externalSystemsConfig.getSystem(systemName);
    if (!system) return;

    const breaker = this.circuitBreakers.get(systemName) || {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      timeout: system.circuitBreaker.timeout
    };

    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failureCount >= system.circuitBreaker.threshold) {
      breaker.state = 'OPEN';
    }

    this.circuitBreakers.set(systemName, breaker);
  }

  shouldRetry(systemName) {
    const system = externalSystemsConfig.getSystem(systemName);
    if (!system) return false;

    const breaker = this.circuitBreakers.get(systemName);
    if (!breaker) return true;

    return breaker.failureCount < system.retryConfig.maxRetries;
  }

  getRoundRobinIndex() {
    if (!this.roundRobinIndex) {
      this.roundRobinIndex = 0;
    }
    return this.roundRobinIndex++;
  }

  incrementRequestCount(systemName) {
    const current = this.requestCounts.get(systemName) || 0;
    this.requestCounts.set(systemName, current + 1);
  }

  decrementRequestCount(systemName) {
    const current = this.requestCounts.get(systemName) || 0;
    if (current > 0) {
      this.requestCounts.set(systemName, current - 1);
    }
  }

  /**
   * Obtém estatísticas dos sistemas
   */
  getSystemStats() {
    const stats = {};
    
    for (const [systemName, breaker] of this.circuitBreakers) {
      stats[systemName] = {
        state: breaker.state,
        failureCount: breaker.failureCount,
        lastFailureTime: breaker.lastFailureTime,
        requestCount: this.requestCounts.get(systemName) || 0
      };
    }

    return stats;
  }
}

module.exports = new IntelligentRouter();
