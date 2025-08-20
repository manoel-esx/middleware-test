const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const externalSystemsConfig = require('../config/externalSystems');
const intelligentRouter = require('../services/router');
const { logger } = require('../utils/logger');

// Middleware para validar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

// GET /api/systems - Listar todos os sistemas
router.get('/', (req, res) => {
  try {
    const systems = externalSystemsConfig.getAllSystems();
    const stats = intelligentRouter.getSystemStats();
    const erpMappings = intelligentRouter.getErpMappings();
    
    const systemsWithStats = Object.keys(systems).map(systemId => {
      const system = systems[systemId];
      const systemStats = stats[systemId] || {};
      
      return {
        id: systemId,
        name: system.name,
        baseUrl: system.baseUrl,
        enabled: system.enabled,
        priority: system.priority,
        timeout: system.timeout,
        status: {
          circuitBreaker: systemStats.state || 'CLOSED',
          failureCount: systemStats.failureCount || 0,
          requestCount: systemStats.requestCount || 0,
          lastFailureTime: systemStats.lastFailureTime || null
        },
        config: {
          retry: system.retryConfig,
          circuitBreaker: system.circuitBreaker
        }
      };
    });

    res.json({
      success: true,
      data: systemsWithStats,
      count: systemsWithStats.length,
      erpMappings, // Novo: incluir mapeamentos ERP
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao listar sistemas:', error);
    res.status(500).json({
      error: 'Erro interno ao listar sistemas',
      message: error.message
    });
  }
});

// NOVAS ROTAS PARA GERENCIAMENTO DE ERP (DEVEM VIR ANTES DAS ROTAS GENÉRICAS)

// GET /api/systems/erp-mappings - Listar todos os mapeamentos ERP
router.get('/erp-mappings', (req, res) => {
  try {
    const erpMappings = intelligentRouter.getErpMappings();
    
    res.json({
      success: true,
      data: erpMappings,
      count: Object.keys(erpMappings).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao listar mapeamentos ERP:', error);
    res.status(500).json({
      error: 'Erro interno ao listar mapeamentos ERP',
      message: error.message
    });
  }
});

// POST /api/systems/erp-mappings - Configurar mapeamento ERP
router.post('/erp-mappings', [
  body('erpId').notEmpty().withMessage('ERP ID é obrigatório'),
  body('systemId').notEmpty().withMessage('ID do sistema é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { erpId, systemId } = req.body;
    
    // Verificar se o sistema existe
    const system = externalSystemsConfig.getSystem(systemId);
    if (!system) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId
      });
    }
    
    // Verificar se o sistema está habilitado
    if (!system.enabled) {
      return res.status(400).json({
        error: 'Sistema está desabilitado',
        systemId
      });
    }
    
    // Configurar mapeamento
    intelligentRouter.configureErpMapping(erpId, systemId);
    
    res.status(201).json({
      success: true,
      message: `Mapeamento ERP ${erpId} -> Sistema ${systemId} configurado com sucesso`,
      data: {
        erpId,
        systemId,
        systemName: system.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao configurar mapeamento ERP:', error);
    res.status(500).json({
      error: 'Erro interno ao configurar mapeamento ERP',
      message: error.message
    });
  }
});

// DELETE /api/systems/erp-mappings/:erpId - Remover mapeamento ERP
router.delete('/erp-mappings/:erpId', [
  param('erpId').notEmpty().withMessage('ERP ID é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { erpId } = req.params;
    
    const removed = intelligentRouter.removeErpMapping(erpId);
    
    if (!removed) {
      return res.status(404).json({
        error: 'Mapeamento ERP não encontrado',
        erpId
      });
    }
    
    res.json({
      success: true,
      message: `Mapeamento ERP ${erpId} removido com sucesso`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao remover mapeamento ERP:', error);
    res.status(500).json({
      error: 'Erro interno ao remover mapeamento ERP',
      message: error.message
    });
  }
});

// GET /api/systems/erp-mappings/:erpId - Obter mapeamento específico
router.get('/erp-mappings/:erpId', [
  param('erpId').notEmpty().withMessage('ERP ID é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { erpId } = req.params;
    const erpMappings = intelligentRouter.getErpMappings();
    
    if (!erpMappings[erpId]) {
      return res.status(404).json({
        error: 'Mapeamento ERP não encontrado',
        erpId
      });
    }
    
    const systemId = erpMappings[erpId];
    const system = externalSystemsConfig.getSystem(systemId);
    
    res.json({
      success: true,
      data: {
        erpId,
        systemId,
        systemName: system ? system.name : 'Sistema não encontrado',
        systemEnabled: system ? system.enabled : false
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter mapeamento ERP:', error);
    res.status(500).json({
      error: 'Erro interno ao obter mapeamento ERP',
      message: error.message
    });
  }
});

// GET /api/systems/:id - Obter sistema específico
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('ID do sistema é obrigatório'),
  handleValidationErrors
], (req, res) => {
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

    res.json({
      success: true,
      data: {
        id,
        name: system.name,
        baseUrl: system.baseUrl,
        enabled: system.enabled,
        priority: system.priority,
        timeout: system.timeout,
        status: {
          circuitBreaker: systemStats.state || 'CLOSED',
          failureCount: systemStats.failureCount || 0,
          requestCount: systemStats.requestCount || 0,
          lastFailureTime: systemStats.lastFailureTime || null
        },
        config: {
          retry: system.retryConfig,
          circuitBreaker: system.circuitBreaker
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao obter sistema',
      message: error.message
    });
  }
});

// PUT /api/systems/:id/enable - Habilitar sistema
router.put('/:id/enable', [
  param('id').isString().notEmpty().withMessage('ID do sistema é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { id } = req.params;
    const success = externalSystemsConfig.updateSystemStatus(id, true);
    
    if (!success) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId: id
      });
    }

    logger.info(`Sistema ${id} habilitado`);
    
    res.json({
      success: true,
      message: `Sistema ${id} habilitado com sucesso`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao habilitar sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao habilitar sistema',
      message: error.message
    });
  }
});

// PUT /api/systems/:id/disable - Desabilitar sistema
router.put('/:id/disable', [
  param('id').isString().notEmpty().withMessage('ID do sistema é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { id } = req.params;
    const success = externalSystemsConfig.updateSystemStatus(id, false);
    
    if (!success) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId: id
      });
    }

    logger.info(`Sistema ${id} desabilitado`);
    
    res.json({
      success: true,
      message: `Sistema ${id} desabilitado com sucesso`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao desabilitar sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao desabilitar sistema',
      message: error.message
    });
  }
});

// PUT /api/systems/:id/priority - Atualizar prioridade do sistema
router.put('/:id/priority', [
  param('id').isString().notEmpty().withMessage('ID do sistema é obrigatório'),
  body('priority').isInt({ min: 1, max: 100 }).withMessage('Prioridade deve ser um número entre 1 e 100'),
  handleValidationErrors
], (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    const system = externalSystemsConfig.getSystem(id);
    if (!system) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId: id
      });
    }

    system.priority = priority;
    logger.info(`Prioridade do sistema ${id} atualizada para ${priority}`);
    
    res.json({
      success: true,
      message: `Prioridade do sistema ${id} atualizada para ${priority}`,
      data: {
        id,
        priority,
        name: system.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao atualizar prioridade do sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao atualizar prioridade',
      message: error.message
    });
  }
});

// POST /api/systems - Adicionar novo sistema
router.post('/', [
  body('id').isString().notEmpty().withMessage('ID do sistema é obrigatório'),
  body('name').isString().notEmpty().withMessage('Nome do sistema é obrigatório'),
  body('baseUrl').notEmpty().withMessage('URL base é obrigatória'),
  body('apiKey').isString().notEmpty().withMessage('API Key é obrigatória'),
  body('timeout').optional().isInt({ min: 100, max: 60000 }).withMessage('Timeout deve ser entre 100ms e 60s'),
  body('priority').optional().isInt({ min: 1, max: 100 }).withMessage('Prioridade deve ser entre 1 e 100'),
  handleValidationErrors
], (req, res) => {
  try {
    const {
      id,
      name,
      baseUrl,
      apiKey,
      timeout = 5000,
      priority = 999
    } = req.body;

    // Verificar se o sistema já existe
    if (externalSystemsConfig.getSystem(id)) {
      return res.status(409).json({
        error: 'Sistema já existe',
        systemId: id
      });
    }

    const newSystem = {
      name,
      baseUrl,
      apiKey,
      timeout,
      priority,
      enabled: true,
      retryConfig: {
        maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
        retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 1000
      },
      circuitBreaker: {
        threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
        timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS) || 60000
      }
    };

    externalSystemsConfig.addSystem(id, newSystem);
    
    logger.info(`Novo sistema adicionado: ${id}`);
    
    res.status(201).json({
      success: true,
      message: 'Sistema adicionado com sucesso',
      data: {
        id,
        name,
        baseUrl,
        enabled: true,
        priority,
        timeout
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao adicionar sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao adicionar sistema',
      message: error.message
    });
  }
});

// DELETE /api/systems/:id - Remover sistema
router.delete('/:id', [
  param('id').isString().notEmpty().withMessage('ID do sistema é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { id } = req.params;
    const success = externalSystemsConfig.removeSystem(id);
    
    if (!success) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId: id
      });
    }

    logger.info(`Sistema ${id} removido`);
    
    res.json({
      success: true,
      message: `Sistema ${id} removido com sucesso`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao remover sistema:', error);
    res.status(500).json({
      error: 'Erro interno ao remover sistema',
      message: error.message
    });
  }
});

// GET /api/systems/stats/overview - Estatísticas gerais
router.get('/stats/overview', (req, res) => {
  try {
    const systems = externalSystemsConfig.getAllSystems();
    const stats = intelligentRouter.getSystemStats();
    
    const overview = {
      totalSystems: Object.keys(systems).length,
      enabledSystems: Object.values(systems).filter(s => s.enabled).length,
      disabledSystems: Object.values(systems).filter(s => !s.enabled).length,
      systemsByStatus: {
        CLOSED: 0,
        OPEN: 0,
        HALF_OPEN: 0
      },
      totalRequests: 0,
      totalFailures: 0
    };

    Object.values(systems).forEach(system => {
      const systemStats = stats[system.name] || {};
      overview.systemsByStatus[systemStats.state || 'CLOSED']++;
      overview.totalRequests += systemStats.requestCount || 0;
      overview.totalFailures += systemStats.failureCount || 0;
    });

    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno ao obter estatísticas',
      message: error.message
    });
  }
});

// NOVAS ROTAS PARA GERENCIAMENTO DE ERP (DEVEM VIR ANTES DAS ROTAS GENÉRICAS)

// GET /api/systems/erp-mappings - Listar todos os mapeamentos ERP
router.get('/erp-mappings', (req, res) => {
  try {
    const erpMappings = intelligentRouter.getErpMappings();
    
    res.json({
      success: true,
      data: erpMappings,
      count: Object.keys(erpMappings).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao listar mapeamentos ERP:', error);
    res.status(500).json({
      error: 'Erro interno ao listar mapeamentos ERP',
      message: error.message
    });
  }
});

// POST /api/systems/erp-mappings - Configurar mapeamento ERP
router.post('/erp-mappings', [
  body('erpId').notEmpty().withMessage('ERP ID é obrigatório'),
  body('systemId').notEmpty().withMessage('ID do sistema é obrigatório'),
  handleValidationErrors
], (req, res) => {
  try {
    const { erpId, systemId } = req.body;
    
    // Verificar se o sistema existe
    const system = externalSystemsConfig.getSystem(systemId);
    if (!system) {
      return res.status(404).json({
        error: 'Sistema não encontrado',
        systemId
      });
    }
    
    // Verificar se o sistema está habilitado
    if (!system.enabled) {
      return res.status(400).json({
        error: 'Sistema está desabilitado',
        systemId
      });
    }
    
    // Configurar mapeamento
    intelligentRouter.configureErpMapping(erpId, systemId);
    
    res.status(201).json({
      success: true,
      message: `Mapeamento ERP ${erpId} -> Sistema ${systemId} configurado com sucesso`,
      data: {
        erpId,
        systemId,
        systemName: system.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao configurar mapeamento ERP:', error);
    res.status(500).json({
      error: 'Erro interno ao configurar mapeamento ERP',
      message: error.message
    });
  }
});

module.exports = router;
