const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

// Rota OPTIONS para CORS
router.options('/verificar-bloqueio-vg', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Endpoint para verificar bloqueio VG
router.post('/verificar-bloqueio-vg', (req, res) => {
  try {
    // Log da requisição recebida
    logger.info('Requisição recebida para verificar bloqueio VG', {
      endpoint: '/loja/verificar-bloqueio-vg',
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    });

    // Simular dados de resposta - apenas lista de IDs (como o código original esperava)
    const response = {
      resultado: [
        "001",
        "003", 
        "007",
        "015",
        "023"
      ]
    };

    // Log da resposta enviada
    logger.info('Resposta enviada para verificar bloqueio VG', {
      endpoint: '/loja/verificar-bloqueio-vg',
      response: response,
      timestamp: new Date().toISOString()
    });

    // Configurar headers para compatibilidade com C#
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Retornar resposta no formato esperado pelo C#
    res.status(200).json(response);

  } catch (error) {
    logger.error('Erro ao processar verificação de bloqueio VG', {
      endpoint: '/loja/verificar-bloqueio-vg',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Resposta de erro no formato esperado
    res.status(500).json({
      resultado: []
    });
  }
});

// Endpoint GET para verificar se a rota está funcionando
router.get('/verificar-bloqueio-vg', (req, res) => {
  res.json({
    message: 'Endpoint de verificação de bloqueio VG ativo',
    description: 'Use POST para verificar bloqueios VG',
    endpoint: '/loja/verificar-bloqueio-vg',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz da loja
router.get('/', (req, res) => {
  res.json({
    message: 'API de Loja - Sistema de Roteamento Inteligente',
    endpoints: {
      verificarBloqueioVG: '/loja/verificar-bloqueio-vg - Verificar bloqueios VG',
      docs: 'Documentação da API de Loja'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
