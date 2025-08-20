const express = require('express');
const router = express.Router();
const externalSystemsConfig = require('../config/externalSystems');
const intelligentRouter = require('../services/router');
const { logger } = require('../utils/logger');

// GET /api/health - Status geral de saúde
router.get('/', (req, res) => {
  try {
    const systems = externalSystemsConfig.getAllSystems();
    const stats = intelligentRouter.getSystemStats();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      systems: {
        total: Object.keys(systems).length,
        healthy: 0,
        unhealthy: 0,
        disabled: 0
      },
      details: {}
    };

    // Verificar saúde de cada sistema
    Object.keys(systems).forEach(systemId => {
      const system = systems[systemId];
      const systemStats = stats[systemId] || {};
      
      let systemHealth = 'healthy';
      let issues = [];

      if (!system.enabled) {
        systemHealth = 'disabled';
        healthStatus.systems.disabled++;
      } else if (systemStats.state === 'OPEN') {
        systemHealth = 'unhealthy';
        healthStatus.systems.unhealthy++;
        issues.push('Circuit breaker aberto');
      } else if (systemStats.failureCount > 0) {
        systemHealth = 'degraded';
        healthStatus.systems.unhealthy++;
        issues.push(`${systemStats.failureCount} falhas recentes`);
      } else {
        healthStatus.systems.healthy++;
      }

      healthStatus.details[systemId] = {
        name: system.name,
        status: systemHealth,
        enabled: system.enabled,
        baseUrl: system.baseUrl,
        circuitBreaker: systemStats.state || 'CLOSED',
        failureCount: systemStats.failureCount || 0,
        requestCount: systemStats.requestCount || 0,
        lastFailureTime: systemStats.lastFailureTime || null,
        issues
      };
    });

    // Determinar status geral
    if (healthStatus.systems.unhealthy > 0) {
      healthStatus.status = 'degraded';
    }
    
    if (healthStatus.systems.healthy === 0 && healthStatus.systems.disabled === 0) {
      healthStatus.status = 'unhealthy';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Erro ao verificar saúde dos sistemas:', error);
    res.status(500).json({
      status: 'error',
      error: 'Erro interno ao verificar saúde',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/health/systems - Status detalhado de todos os sistemas
router.get('/systems', (req, res) => {
  try {
    const systems = externalSystemsConfig.getAllSystems();
    const stats = intelligentRouter.getSystemStats();
    
    const systemsHealth = Object.keys(systems).map(systemId => {
      const system = systems[systemId];
      const systemStats = stats[systemId] || {};
      
      let health = 'healthy';
      let issues = [];

      if (!system.enabled) {
        health = 'disabled';
      } else if (systemStats.state === 'OPEN') {
        health = 'unhealthy';
        issues.push('Circuit breaker aberto');
      } else if (systemStats.failureCount > 0) {
        health = 'degraded';
        issues.push(`${systemStats.failureCount} falhas recentes`);
      }

      return {
        id: systemId,
        name: system.name,
        health,
        enabled: system.enabled,
        baseUrl: system.baseUrl,
        priority: system.priority,
        timeout: system.timeout,
        circuitBreaker: {
          state: systemStats.state || 'CLOSED',
          failureCount: systemStats.failureCount || 0,
          lastFailureTime: systemStats.lastFailureTime || null
        },
        metrics: {
          requestCount: systemStats.requestCount || 0,
          successRate: systemStats.requestCount > 0 ? 
            ((systemStats.requestCount - systemStats.failureCount) / systemStats.requestCount * 100).toFixed(2) : 100
        },
        issues,
        lastCheck: new Date().toISOString()
      };
    });

    res.json({
      success: true,
      data: systemsHealth,
      summary: {
        total: systemsHealth.length,
        healthy: systemsHealth.filter(s => s.health === 'healthy').length,
        degraded: systemsHealth.filter(s => s.health === 'degraded').length,
        unhealthy: systemsHealth.filter(s => s.health === 'unhealthy').length,
        disabled: systemsHealth.filter(s => s.health === 'disabled').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter saúde dos sistemas:', error);
    res.status(500).json({
      error: 'Erro interno ao obter saúde dos sistemas',
      message: error.message
    });
  }
});

// GET /api/health/systems/:id - Status de um sistema específico
router.get('/systems/:id', (req, res) => {
  try {
    const { id } = req.params;
    const system = externalSystemsConfig.getSystem(id);
    
    if (!system) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId: id
      });
    }

    const stats = intelligentRouter.getSystemStats();
    const systemStats = stats[id] || {};
    
    let health = 'healthy';
    let issues = [];

    if (!system.enabled) {
      health = 'disabled';
    } else if (systemStats.state === 'OPEN') {
      health = 'unhealthy';
      issues.push('Circuit breaker aberto');
    } else if (systemStats.failureCount > 0) {
      health = 'degraded';
      issues.push(`${systemStats.failureCount} falhas recentes`);
    }

    const systemHealth = {
      id,
      name: system.name,
      health,
      enabled: system.enabled,
      baseUrl: system.baseUrl,
      priority: system.priority,
      timeout: system.timeout,
      circuitBreaker: {
        state: systemStats.state || 'CLOSED',
        failureCount: systemStats.failureCount || 0,
        lastFailureTime: systemStats.lastFailureTime || null,
        threshold: system.circuitBreaker.threshold,
        timeout: system.circuitBreaker.timeout
      },
      retry: {
        maxRetries: system.retryConfig.maxRetries,
        retryDelay: system.retryConfig.retryDelay
      },
      metrics: {
        requestCount: systemStats.requestCount || 0,
        successRate: systemStats.requestCount > 0 ? 
          ((systemStats.requestCount - systemStats.failureCount) / systemStats.requestCount * 100).toFixed(2) : 100
      },
      issues,
      lastCheck: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter saúde do sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao obter saúde do sistema',
      message: error.message
    });
  }
});

// POST /api/health/systems/:id/test - Testar conectividade de um sistema
router.post('/systems/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const system = externalSystemsConfig.getSystem(id);
    
    if (!system) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId: id
      });
    }

    if (!system.enabled) {
      return res.status(400).json({
        error: 'Sistema está desabilitado',
        systemId: id
      });
    }

    const startTime = Date.now();
    let testResult;

    try {
      // Fazer uma requisição de teste para o sistema
      testResult = await intelligentRouter.routeToSpecificSystem(
        id, 
        '/health', 
        'GET', 
        null, 
        system.timeout
      );
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: {
          systemId: id,
          systemName: system.name,
          status: 'connected',
          responseTime: `${responseTime}ms`,
          response: testResult.data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: false,
        data: {
          systemId: id,
          systemName: system.name,
          status: 'failed',
          responseTime: `${responseTime}ms`,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    logger.error('Erro ao testar sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao testar sistema',
      message: error.message
    });
  }
});

module.exports = router;
