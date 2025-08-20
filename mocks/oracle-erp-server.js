const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Simular delay de rede
const simulateNetworkDelay = (min = 150, max = 600) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (max - min) + min);
  });
};

// Middleware de autenticação mock
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.includes('oracle_mock_key_456')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key for Oracle ERP',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Aplicar autenticação em todas as rotas
app.use(authenticateRequest);

// Health check
app.get('/health', async (req, res) => {
  await simulateNetworkDelay(50, 200);
  
  res.json({
    status: 'healthy',
    system: 'Oracle ERP Mock',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de vendas - total bruta
app.post('/vendas/total-bruta', async (req, res) => {
  await simulateNetworkDelay(250, 900);
  
  const { empresaId, lojaId } = req.body;
  
  if (!empresaId || !lojaId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'empresaId e lojaId são obrigatórios',
      timestamp: new Date().toISOString()
    });
  }
  
  // Simular dados do Oracle
  const mockData = {
    totalVendaBruta: Math.floor(Math.random() * 800000) + 100000,
    periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
    empresaId,
    lojaId,
    sistema: 'Oracle',
    moeda: 'BRL',
    detalhes: {
      vendasAVista: Math.floor(Math.random() * 300000) + 30000,
      vendasAPrazo: Math.floor(Math.random() * 500000) + 50000,
      descontoTotal: Math.floor(Math.random() * 15000) + 2000
    },
    metadata: {
      processadoEm: new Date().toISOString(),
      versaoAPI: '2.1.0',
      origem: 'Oracle ERP Mock'
    }
  };
  
  res.json(mockData);
});

// Endpoint de produtos
app.get('/produtos/:id', async (req, res) => {
  await simulateNetworkDelay(200, 700);
  
  const { id } = req.params;
  
  const mockProduto = {
    id: parseInt(id),
    nome: `Produto Oracle ${id}`,
    codigo: `ORA-${id.toString().padStart(6, '0')}`,
    preco: Math.floor(Math.random() * 1500) + 15,
    estoque: Math.floor(Math.random() * 150) + 5,
    categoria: 'Produtos Oracle',
    sistema: 'Oracle',
    timestamp: new Date().toISOString()
  };
  
  res.json(mockProduto);
});

// Endpoint de clientes
app.get('/clientes/:id', async (req, res) => {
  await simulateNetworkDelay(150, 500);
  
  const { id } = req.params;
  
  const mockCliente = {
    id: parseInt(id),
    nome: `Cliente Oracle ${id}`,
    email: `cliente${id}@oracle.com`,
    telefone: `+55 21 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    sistema: 'Oracle',
    timestamp: new Date().toISOString()
  };
  
  res.json(mockCliente);
});

// Endpoint genérico para qualquer rota
app.all('*', async (req, res) => {
  await simulateNetworkDelay(150, 400);
  
  res.json({
    message: 'Oracle ERP Mock - Endpoint genérico',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    sistema: 'Oracle'
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Oracle ERP Mock rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key: oracle_mock_key_456`);
});

module.exports = app;
