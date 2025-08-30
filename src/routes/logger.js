const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

// Rota POST genérica para logging de requisições (aceita qualquer caminho)
router.post('*', (req, res) => {
  try {
    // Extrair informações da requisição
    const requestData = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Log da requisição completa
    logger.info('Requisição recebida para logging', {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...requestData
    });

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Requisição recebida e logada com sucesso',
      requestId: requestData.requestId,
      timestamp: requestData.timestamp,
      receivedData: {
        method: requestData.method,
        url: requestData.url,
        bodySize: JSON.stringify(req.body).length,
        headersCount: Object.keys(req.headers).length
      }
    });

  } catch (error) {
    logger.error('Erro ao processar requisição de logging', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      message: 'Erro interno ao processar requisição',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota GET para verificar se o endpoint está funcionando (aceita qualquer caminho)
router.get('*', (req, res) => {
  res.json({
    message: 'Endpoint de logging ativo',
    description: 'Use POST para enviar dados para logging. Aceita qualquer caminho após /api/logger/',
    currentPath: req.path,
    fullUrl: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
