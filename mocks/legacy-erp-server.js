const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Simular delay de rede (mais lento para simular sistema legado)
const simulateNetworkDelay = (min = 500, max = 2000) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (max - min) + min);
  });
};

// Middleware de autenticação mock
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.includes('legacy_mock_key_999')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key for Legacy ERP',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Aplicar autenticação em todas as rotas
app.use(authenticateRequest);

// Health check
app.get('/health', async (req, res) => {
  await simulateNetworkDelay(200, 500);
  
  res.json({
    status: 'degraded', // Sistema legado com performance degradada
    system: 'Legacy ERP Mock',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    warning: 'Sistema legado - performance limitada'
  });
});

// Endpoint de vendas - total bruta
app.post('/vendas/total-bruta', async (req, res) => {
  await simulateNetworkDelay(800, 2500);
  
  const { empresaId, lojaId } = req.body;
  
  if (!empresaId || !lojaId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'empresaId e lojaId são obrigatórios',
      timestamp: new Date().toISOString()
    });
  }
  
  // Simular dados do sistema legado
  const mockData = {
    totalVendaBruta: Math.floor(Math.random() * 200000) + 20000,
    periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
    empresaId,
    lojaId,
    sistema: 'Legacy ERP',
    moeda: 'BRL',
    detalhes: {
      vendasAVista: Math.floor(Math.random() * 100000) + 10000,
      vendasAPrazo: Math.floor(Math.random() * 100000) + 10000,
      descontoTotal: Math.floor(Math.random() * 5000) + 500
    },
    metadata: {
      processadoEm: new Date().toISOString(),
      versaoAPI: '1.0.0',
      origem: 'Legacy ERP Mock',
      warning: 'Sistema legado - dados podem estar desatualizados'
    }
  };
  
  res.json(mockData);
});

// Endpoint de produtos
app.get('/produtos/:id', async (req, res) => {
  await simulateNetworkDelay(600, 1800);
  
  const { id } = req.params;
  
  const mockProduto = {
    id: parseInt(id),
    nome: `Produto Legacy ${id}`,
    codigo: `LEG-${id.toString().padStart(6, '0')}`,
    preco: Math.floor(Math.random() * 500) + 5,
    estoque: Math.floor(Math.random() * 50) + 1,
    categoria: 'Produtos Legacy',
    sistema: 'Legacy ERP',
    timestamp: new Date().toISOString(),
    warning: 'Dados do sistema legado podem estar desatualizados'
  };
  
  res.json(mockProduto);
});

// Endpoint de clientes
app.get('/clientes/:id', async (req, res) => {
  await simulateNetworkDelay(500, 1500);
  
  const { id } = req.params;
  
  const mockCliente = {
    id: parseInt(id),
    nome: `Cliente Legacy ${id}`,
    email: `cliente${id}@legacy.com`,
    telefone: `+55 41 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    sistema: 'Legacy ERP',
    timestamp: new Date().toISOString(),
    warning: 'Dados do sistema legado podem estar desatualizados'
  };
  
  res.json(mockCliente);
});

// Endpoint genérico para qualquer rota
app.all('*', async (req, res) => {
  await simulateNetworkDelay(400, 1200);
  
  res.json({
    message: 'Legacy ERP Mock - Endpoint genérico',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    sistema: 'Legacy ERP',
    warning: 'Sistema legado - performance limitada'
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Legacy ERP Mock rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key: legacy_mock_key_999`);
  console.log(`⚠️  Sistema legado - performance limitada`);
});

module.exports = app;
