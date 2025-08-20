const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();
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

// Middleware para extrair ERP ID do header
const extractErpId = (req, res, next) => {
  req.erpId = req.headers['x-erp-id'] || req.headers['X-ERP-ID'];
  if (req.erpId) {
    logger.info(`ERP ID extraído do header: ${req.erpId}`);
  }
  next();
};

// Aplicar middleware de ERP ID em todas as rotas
router.use(extractErpId);

// Rota GET - Para requisições de leitura
router.get('*', [
  query('targetSystem').optional().isString(),
  query('strategy').optional().isIn(['priority', 'round-robin', 'load-balance', 'failover']),
  query('timeout').optional().isInt({ min: 1000, max: 30000 }),
  query('retry').optional().isBoolean(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const endpoint = req.params[0] || '/';
    const options = {
      targetSystem: req.query.targetSystem,
      strategy: req.query.strategy,
      timeout: req.query.timeout ? parseInt(req.query.timeout) : null,
      retry: req.query.retry !== 'false',
      erpId: req.erpId // Novo: passar ERP ID para o roteador
    };

    logger.info('Requisição GET recebida:', {
      endpoint,
      options,
      query: req.query,
      erpId: req.erpId
    });

    const result = await intelligentRouter.routeRequest(endpoint, 'GET', null, options);
    
    res.json({
      success: true,
      data: result.data,
      metadata: {
        system: result.system,
        status: result.status,
        timestamp: result.timestamp,
        strategy: options.strategy || 'priority',
        erpId: req.erpId,
        routingMethod: req.erpId ? 'erp-mapping' : (options.targetSystem ? 'specific-system' : 'strategy')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota POST - Para criação de recursos
router.post('*', [
  body().notEmpty().withMessage('Body da requisição é obrigatório'),
  query('targetSystem').optional().isString(),
  query('strategy').optional().isIn(['priority', 'round-robin', 'load-balance', 'failover']),
  query('timeout').optional().isInt({ min: 1000, max: 30000 }),
  query('retry').optional().isBoolean(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const endpoint = req.params[0] || '/';
    const options = {
      targetSystem: req.query.targetSystem,
      strategy: req.query.strategy,
      timeout: req.query.timeout ? parseInt(req.query.timeout) : null,
      retry: req.query.retry !== 'false',
      erpId: req.erpId // Novo: passar ERP ID para o roteador
    };

    logger.info('Requisição POST recebida:', {
      endpoint,
      options,
      body: req.body,
      erpId: req.erpId
    });

    const result = await intelligentRouter.routeRequest(endpoint, 'POST', req.body, options);
    
    res.status(201).json({
      success: true,
      data: result.data,
      metadata: {
        system: result.system,
        status: result.status,
        timestamp: result.timestamp,
        strategy: options.strategy || 'priority',
        erpId: req.erpId,
        routingMethod: req.erpId ? 'erp-mapping' : (options.targetSystem ? 'specific-system' : 'strategy')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota PUT - Para atualização completa de recursos
router.put('*', [
  body().notEmpty().withMessage('Body da requisição é obrigatório'),
  query('targetSystem').optional().isString(),
  query('strategy').optional().isIn(['priority', 'round-robin', 'load-balance', 'failover']),
  query('timeout').optional().isInt({ min: 1000, max: 30000 }),
  query('retry').optional().isBoolean(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const endpoint = req.params[0] || '/';
    const options = {
      targetSystem: req.query.targetSystem,
      strategy: req.query.strategy,
      timeout: req.query.timeout ? parseInt(req.query.timeout) : null,
      retry: req.query.retry !== 'false',
      erpId: req.erpId // Novo: passar ERP ID para o roteador
    };

    logger.info('Requisição PUT recebida:', {
      endpoint,
      options,
      body: req.body,
      erpId: req.erpId
    });

    const result = await intelligentRouter.routeRequest(endpoint, 'PUT', req.body, options);
    
    res.json({
      success: true,
      data: result.data,
      metadata: {
        system: result.system,
        status: result.status,
        timestamp: result.timestamp,
        strategy: options.strategy || 'priority',
        erpId: req.erpId,
        routingMethod: req.erpId ? 'erp-mapping' : (options.targetSystem ? 'specific-system' : 'strategy')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota PATCH - Para atualização parcial de recursos
router.patch('*', [
  body().notEmpty().withMessage('Body da requisição é obrigatório'),
  query('targetSystem').optional().isString(),
  query('strategy').optional().isIn(['priority', 'round-robin', 'load-balance', 'failover']),
  query('timeout').optional().isInt({ min: 1000, max: 30000 }),
  query('retry').optional().isBoolean(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const endpoint = req.params[0] || '/';
    const options = {
      targetSystem: req.query.targetSystem,
      strategy: req.query.strategy,
      timeout: req.query.timeout ? parseInt(req.query.timeout) : null,
      retry: req.query.retry !== 'false',
      erpId: req.erpId // Novo: passar ERP ID para o roteador
    };

    logger.info('Requisição PATCH recebida:', {
      endpoint,
      options,
      body: req.body,
      erpId: req.erpId
    });

    const result = await intelligentRouter.routeRequest(endpoint, 'PATCH', req.body, options);
    
    res.json({
      success: true,
      data: result.data,
      metadata: {
        system: result.system,
        status: result.status,
        timestamp: result.timestamp,
        strategy: options.strategy || 'priority',
        erpId: req.erpId,
        routingMethod: req.erpId ? 'erp-mapping' : (options.targetSystem ? 'specific-system' : 'strategy')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota DELETE - Para remoção de recursos
router.delete('*', [
  query('targetSystem').optional().isString(),
  query('strategy').optional().isIn(['priority', 'round-robin', 'load-balance', 'failover']),
  query('timeout').optional().isInt({ min: 1000, max: 30000 }),
  query('retry').optional().isBoolean(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const endpoint = req.params[0] || '/';
    const options = {
      targetSystem: req.query.targetSystem,
      strategy: req.query.strategy,
      timeout: req.query.timeout ? parseInt(req.query.timeout) : null,
      retry: req.query.retry !== 'false',
      erpId: req.erpId // Novo: passar ERP ID para o roteador
    };

    logger.info('Requisição DELETE recebida:', {
      endpoint,
      options,
      erpId: req.erpId
    });

    const result = await intelligentRouter.routeRequest(endpoint, 'DELETE', null, options);
    
    res.json({
      success: true,
      data: result.data,
      metadata: {
        system: result.system,
        status: result.status,
        timestamp: result.timestamp,
        strategy: options.strategy || 'priority',
        erpId: req.erpId,
        routingMethod: req.erpId ? 'erp-mapping' : (options.targetSystem ? 'specific-system' : 'strategy')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota para requisições customizadas (método específico)
router.all('*', [
  query('method').isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).withMessage('Método HTTP é obrigatório'),
  query('targetSystem').optional().isString(),
  query('strategy').optional().isIn(['priority', 'round-robin', 'load-balance', 'failover']),
  query('timeout').optional().isInt({ min: 1000, max: 30000 }),
  query('retry').optional().isBoolean(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const endpoint = req.params[0] || '/';
    const method = req.query.method;
    const options = {
      targetSystem: req.query.targetSystem,
      strategy: req.query.strategy,
      timeout: req.query.timeout ? parseInt(req.query.timeout) : null,
      retry: req.query.retry !== 'false',
      erpId: req.erpId // Novo: passar ERP ID para o roteador
    };

    logger.info('Requisição customizada recebida:', {
      method,
      endpoint,
      options,
      body: req.body,
      erpId: req.erpId
    });

    const result = await intelligentRouter.routeRequest(endpoint, method, req.body, options);
    
    res.json({
      success: true,
      data: result.data,
      metadata: {
        system: result.system,
        status: result.status,
        timestamp: result.timestamp,
        strategy: options.strategy || 'priority',
        method,
        erpId: req.erpId,
        routingMethod: req.erpId ? 'erp-mapping' : (options.targetSystem ? 'specific-system' : 'strategy')
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
