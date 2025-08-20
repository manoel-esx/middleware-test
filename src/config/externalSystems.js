const { logger } = require('../utils/logger');

class ExternalSystemsConfig {
  constructor() {
    this.systems = this.loadSystems();
  }

  loadSystems() {
    const systems = {};

    // Sistema A
    if (process.env.EXTERNAL_SYSTEM_A_URL) {
      systems['system-a'] = {
        name: 'Sistema A',
        baseUrl: process.env.EXTERNAL_SYSTEM_A_URL,
        apiKey: process.env.EXTERNAL_SYSTEM_A_API_KEY,
        timeout: parseInt(process.env.EXTERNAL_SYSTEM_A_TIMEOUT) || 5000,
        enabled: true,
        priority: 1,
        retryConfig: {
          maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
          retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 1000
        },
        circuitBreaker: {
          threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS) || 60000
        }
      };
    }

    // Sistema B
    if (process.env.EXTERNAL_SYSTEM_B_URL) {
      systems['system-b'] = {
        name: 'Sistema B',
        baseUrl: process.env.ETERNAL_SYSTEM_B_URL,
        apiKey: process.env.EXTERNAL_SYSTEM_B_API_KEY,
        timeout: parseInt(process.env.EXTERNAL_SYSTEM_B_TIMEOUT) || 5000,
        enabled: true,
        priority: 2,
        retryConfig: {
          maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
          retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 1000
        },
        circuitBreaker: {
          threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS) || 60000
        }
      };
    }

    // Sistema C
    if (process.env.EXTERNAL_SYSTEM_C_URL) {
      systems['system-c'] = {
        name: 'Sistema C',
        baseUrl: process.env.EXTERNAL_SYSTEM_C_URL,
        apiKey: process.env.EXTERNAL_SYSTEM_C_API_KEY,
        timeout: parseInt(process.env.EXTERNAL_SYSTEM_C_TIMEOUT) || 5000,
        enabled: true,
        priority: 3,
        retryConfig: {
          maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
          retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 1000
        },
        circuitBreaker: {
          threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS) || 60000
        }
      };
    }

    logger.info(`Sistemas externos carregados: ${Object.keys(systems).length}`);
    return systems;
  }

  getSystem(systemId) {
    return this.systems[systemId];
  }

  getAllSystems() {
    return this.systems;
  }

  getEnabledSystems() {
    return Object.values(this.systems).filter(system => system.enabled);
  }

  getSystemByPriority() {
    return Object.values(this.systems)
      .filter(system => system.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  updateSystemStatus(systemId, enabled) {
    if (this.systems[systemId]) {
      this.systems[systemId].enabled = enabled;
      logger.info(`Status do sistema ${systemId} atualizado para: ${enabled}`);
      return true;
    }
    return false;
  }

  addSystem(systemId, config) {
    this.systems[systemId] = {
      ...config,
      enabled: true
    };
    logger.info(`Novo sistema adicionado: ${systemId}`);
  }

  removeSystem(systemId) {
    if (this.systems[systemId]) {
      delete this.systems[systemId];
      logger.info(`Sistema removido: ${systemId}`);
      return true;
    }
    return false;
  }
}

module.exports = new ExternalSystemsConfig();
