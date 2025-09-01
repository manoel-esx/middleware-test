const express = require('express');
const router = express.Router();

// Importar todas as rotas
const proxyRoutes = require('./proxy');
const systemRoutes = require('./systems');
const healthRoutes = require('./health');
const loggerRoutes = require('./logger');
const lojaRoutes = require('./loja');

// Aplicar rotas
router.use('/proxy', proxyRoutes);
router.use('/systems', systemRoutes);
router.use('/health', healthRoutes);
router.use('/logger', loggerRoutes);
router.use('/loja', lojaRoutes);

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Middleware - Sistema de Roteamento Inteligente',
    version: '1.0.0',
    endpoints: {
      proxy: '/api/proxy - Roteamento de requisições para sistemas externos',
      systems: '/api/systems - Gerenciamento de sistemas externos',
      health: '/api/health - Status de saúde dos sistemas',
      logger: '/api/logger - Endpoint genérico para logging de requisições',
      loja: '/api/loja - API de Loja com verificação de bloqueio VG',
      docs: '/api/docs - Documentação da API'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
