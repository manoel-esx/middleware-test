const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simular delay de rede
const simulateNetworkDelay = (min = 100, max = 500) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (max - min) + min);
  });
};

// Middleware de autenticação mock
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.includes('sap_mock_key_123')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key for SAP ERP',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Aplicar autenticação em todas as rotas
app.use(authenticateRequest);

// Health check
app.get('/health', async (req, res) => {
  await simulateNetworkDelay(50, 150);
  
  res.json({
    status: 'healthy',
    system: 'SAP ERP Mock',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de vendas - total bruta
app.post('/vendas/total-bruta', async (req, res) => {
  await simulateNetworkDelay(200, 800);
  
  const { empresaId, lojaId } = req.body;
  
  if (!empresaId || !lojaId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'empresaId e lojaId são obrigatórios',
      timestamp: new Date().toISOString()
    });
  }
  
  // Simular dados do SAP
  const mockData = {
    totalVendaBruta: Math.floor(Math.random() * 500000) + 50000,
    periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
    empresaId,
    lojaId,
    sistema: 'SAP',
    moeda: 'BRL',
    detalhes: {
      vendasAVista: Math.floor(Math.random() * 200000) + 20000,
      vendasAPrazo: Math.floor(Math.random() * 300000) + 30000,
      descontoTotal: Math.floor(Math.random() * 10000) + 1000
    },
    metadata: {
      processadoEm: new Date().toISOString(),
      versaoAPI: '1.0.0',
      origem: 'SAP ERP Mock'
    }
  };
  
  res.json(mockData);
});

// Endpoint de produtos
app.get('/produtos/:id', async (req, res) => {
  await simulateNetworkDelay(150, 600);
  
  const { id } = req.params;
  
  const mockProduto = {
    id: parseInt(id),
    nome: `Produto SAP ${id}`,
    codigo: `SAP-${id.toString().padStart(6, '0')}`,
    preco: Math.floor(Math.random() * 1000) + 10,
    estoque: Math.floor(Math.random() * 100) + 1,
    categoria: 'Produtos SAP',
    sistema: 'SAP',
    timestamp: new Date().toISOString()
  };
  
  res.json(mockProduto);
});

// Endpoint de clientes
app.get('/clientes/:id', async (req, res) => {
  await simulateNetworkDelay(100, 400);
  
  const { id } = req.params;
  
  const mockCliente = {
    id: parseInt(id),
    nome: `Cliente SAP ${id}`,
    email: `cliente${id}@sap.com`,
    telefone: `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    sistema: 'SAP',
    timestamp: new Date().toISOString()
  };
  
  res.json(mockCliente);
});

// Endpoint genérico para qualquer rota
app.all('*', async (req, res) => {
  await simulateNetworkDelay(100, 300);
  
  res.json({
    message: 'SAP ERP Mock - Endpoint genérico',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    sistema: 'SAP'
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 SAP ERP Mock rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key: sap_mock_key_123`);
});

module.exports = app;
