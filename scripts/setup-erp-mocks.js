const axios = require('axios');

// Configuração
const MIDDLEWARE_URL = 'http://localhost:3000';
const ERP_SYSTEMS = [
  {
    id: 'sap-erp',
    name: 'SAP ERP System',
    baseUrl: 'http://localhost:3001',
    apiKey: 'sap_mock_key_123',
    timeout: 3000,
    priority: 1
  },
  {
    id: 'oracle-erp',
    name: 'Oracle ERP System',
    baseUrl: 'http://localhost:3002',
    apiKey: 'oracle_mock_key_456',
    timeout: 4000,
    priority: 2
  },
  {
    id: 'dynamics-erp',
    name: 'Microsoft Dynamics ERP',
    baseUrl: 'http://localhost:3003',
    apiKey: 'dynamics_mock_key_789',
    timeout: 5000,
    priority: 3
  },
  {
    id: 'legacy-erp',
    name: 'Legacy ERP System',
    baseUrl: 'http://localhost:3004',
    apiKey: 'legacy_mock_key_999',
    timeout: 8000,
    priority: 4
  }
];

const ERP_MAPPINGS = [
  { erpId: '123', systemId: 'sap-erp' },
  { erpId: '456', systemId: 'oracle-erp' },
  { erpId: '789', systemId: 'dynamics-erp' },
  { erpId: '999', systemId: 'legacy-erp' }
];

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para verificar se o middleware está rodando
async function checkMiddlewareHealth() {
  try {
    const response = await axios.get(`${MIDDLEWARE_URL}/health`);
    console.log('✅ Middleware está rodando');
    return true;
  } catch (error) {
    console.log('❌ Middleware não está rodando. Certifique-se de que está rodando na porta 3000');
    return false;
  }
}

// Função para verificar se um ERP mock está rodando
async function checkErpHealth(baseUrl, name) {
  try {
    // Determinar a chave de autenticação correta para cada ERP
    let apiKey;
    if (baseUrl.includes('3001')) {
      apiKey = 'sap_mock_key_123';
    } else if (baseUrl.includes('3002')) {
      apiKey = 'oracle_mock_key_456';
    } else if (baseUrl.includes('3003')) {
      apiKey = 'dynamics_mock_key_789';
    } else if (baseUrl.includes('3004')) {
      apiKey = 'legacy_mock_key_999';
    } else {
      apiKey = 'unknown_key';
    }
    
    const response = await axios.get(`${baseUrl}/health`, {
      headers: {
        'Authorization': apiKey
      },
      timeout: 5000
    });
    
    console.log(`✅ ${name} está rodando em ${baseUrl}`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`⚠️  ${name} está rodando mas retornou 401 (Unauthorized) - problema de autenticação`);
      return true; // Considerar como "rodando" mesmo com erro de auth
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${name} não está rodando em ${baseUrl} (conexão recusada)`);
    } else {
      console.log(`❌ ${name} erro em ${baseUrl}: ${error.message}`);
    }
    return false;
  }
}

// Função para adicionar sistema ERP
async function addErpSystem(system) {
  try {
    const response = await axios.post(`${MIDDLEWARE_URL}/api/systems`, system);
    console.log(`✅ Sistema ${system.name} adicionado com sucesso`);
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️  Sistema ${system.name} já existe`);
      return true;
    }
    console.log(`❌ Erro ao adicionar sistema ${system.name}:`, error.response?.data?.error || error.message);
    return false;
  }
}

// Função para configurar mapeamento ERP
async function configureErpMapping(mapping) {
  try {
    const response = await axios.post(`${MIDDLEWARE_URL}/api/systems/erp-mappings`, mapping);
    console.log(`✅ Mapeamento ERP ${mapping.erpId} -> ${mapping.systemId} configurado`);
    return true;
  } catch (error) {
    console.log(`❌ Erro ao configurar mapeamento ERP ${mapping.erpId}:`, error.response?.data?.error || error.message);
    return false;
  }
}

// Função principal
async function setupErpMocks() {
  console.log('🚀 Configurando ERPs Mock para testes...\n');
  
  // Verificar se o middleware está rodando
  if (!(await checkMiddlewareHealth())) {
    return;
  }
  
  console.log('\n📋 Verificando ERPs Mock...\n');
  
  // Verificar cada ERP mock
  for (const system of ERP_SYSTEMS) {
    await checkErpHealth(system.baseUrl, system.name);
    await sleep(500); // Pequena pausa entre verificações
  }
  
  console.log('\n🔧 Configurando sistemas no middleware...\n');
  
  // Adicionar sistemas ERP
  for (const system of ERP_SYSTEMS) {
    await addErpSystem(system);
    await sleep(200); // Pequena pausa entre adições
  }
  
  console.log('\n🔗 Configurando mapeamentos ERP...\n');
  
  // Configurar mapeamentos ERP
  for (const mapping of ERP_MAPPINGS) {
    await configureErpMapping(mapping);
    await sleep(200); // Pequena pausa entre configurações
  }
  
  console.log('\n✅ Configuração concluída!');
  console.log('\n📊 Resumo da configuração:');
  console.log('   • 4 sistemas ERP mock configurados');
  console.log('   • 4 mapeamentos ERP configurados');
  console.log('\n🧪 Para testar, use os seguintes ERP IDs:');
  console.log('   • ERP 123 -> SAP (porta 3001)');
  console.log('   • ERP 456 -> Oracle (porta 3002)');
  console.log('   • ERP 789 -> Microsoft Dynamics (porta 3003)');
  console.log('   • ERP 999 -> Legacy (porta 3004)');
  
  console.log('\n📝 Exemplo de uso:');
  console.log('   curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -H "X-ERP-ID: 123" \\');
  console.log('     -d \'{"empresaId": 1, "lojaId": 5}\'');
  
  console.log('\n🔍 Para verificar a configuração:');
  console.log('   curl http://localhost:3000/api/systems');
  console.log('   curl http://localhost:3000/api/systems/erp-mappings');
}

// Executar se chamado diretamente
if (require.main === module) {
  setupErpMocks().catch(console.error);
}

module.exports = { setupErpMocks };
