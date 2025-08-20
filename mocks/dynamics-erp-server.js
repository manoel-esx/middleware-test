const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Simular delay de rede
const simulateNetworkDelay = (min = 200, max = 800) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (max - min) + min);
  });
};

// Middleware de autenticação mock
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.includes('dynamics_mock_key_789')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key for Microsoft Dynamics ERP',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Aplicar autenticação em todas as rotas
app.use(authenticateRequest);

// Health check
app.get('/health', async (req, res) => {
  await simulateNetworkDelay(100, 300);
  
  res.json({
    status: 'healthy',
    system: 'Microsoft Dynamics ERP Mock',
    version: '3.0.1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de vendas - total bruta
app.post('/vendas/total-bruta', async (req, res) => {
  await simulateNetworkDelay(300, 1000);
  
  const { empresaId, lojaId } = req.body;
  
  if (!empresaId || !lojaId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'empresaId e lojaId são obrigatórios',
      timestamp: new Date().toISOString()
    });
  }
  
  // Simular dados do Microsoft Dynamics
  const mockData = {
    totalVendaBruta: Math.floor(Math.random() * 300000) + 30000,
    periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
    empresaId,
    lojaId,
    sistema: 'Microsoft Dynamics',
    moeda: 'BRL',
    detalhes: {
      vendasAVista: Math.floor(Math.random() * 150000) + 15000,
      vendasAPrazo: Math.floor(Math.random() * 150000) + 15000,
      descontoTotal: Math.floor(Math.random() * 8000) + 800
    },
    metadata: {
      processadoEm: new Date().toISOString(),
      versaoAPI: '3.0.1',
      origem: 'Microsoft Dynamics ERP Mock'
    }
  };
  
  res.json(mockData);
});

// Endpoint de produtos
app.get('/produtos/:id', async (req, res) => {
  await simulateNetworkDelay(250, 800);
  
  const { id } = req.params;
  
  const mockProduto = {
    id: parseInt(id),
    nome: `Produto Dynamics ${id}`,
    codigo: `DYN-${id.toString().padStart(6, '0')}`,
    preco: Math.floor(Math.random() * 800) + 8,
    estoque: Math.floor(Math.random() * 80) + 2,
    categoria: 'Produtos Dynamics',
    sistema: 'Microsoft Dynamics',
    timestamp: new Date().toISOString()
  };
  
  res.json(mockProduto);
});

// Endpoint de clientes
app.get('/clientes/:id', async (req, res) => {
  await simulateNetworkDelay(200, 600);
  
  const { id } = req.params;
  
  const mockCliente = {
    id: parseInt(id),
    nome: `Cliente Dynamics ${id}`,
    email: `cliente${id}@dynamics.com`,
    telefone: `+55 31 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    sistema: 'Microsoft Dynamics',
    timestamp: new Date().toISOString()
  };
  
  res.json(mockCliente);
});

// Endpoint genérico para qualquer rota
app.all('*', async (req, res) => {
  await simulateNetworkDelay(200, 500);
  
  res.json({
    message: 'Microsoft Dynamics ERP Mock - Endpoint genérico',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    sistema: 'Microsoft Dynamics'
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Microsoft Dynamics ERP Mock rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key: dynamics_mock_key_789`);
});

module.exports = app;
