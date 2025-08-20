const axios = require('axios');

// Configurações
const MIDDLEWARE_URL = 'http://localhost:3000';
const ERP_SYSTEMS = [
  { name: 'SAP ERP', url: 'http://localhost:3001' },
  { name: 'Oracle ERP', url: 'http://localhost:3002' },
  { name: 'Microsoft Dynamics ERP', url: 'http://localhost:3003' },
  { name: 'Legacy ERP', url: 'http://localhost:3004' }
];

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para testar comunicação com um ERP
async function testErpCommunication(erp) {
  try {
    console.log(`🔍 Testando comunicação com ${erp.name}...`);
    
    // Determinar a chave de autenticação correta para cada ERP
    let apiKey;
    switch (erp.name) {
      case 'SAP ERP':
        apiKey = 'sap_mock_key_123';
        break;
      case 'Oracle ERP':
        apiKey = 'oracle_mock_key_456';
        break;
      case 'Microsoft Dynamics ERP':
        apiKey = 'dynamics_mock_key_789';
        break;
      case 'Legacy ERP':
        apiKey = 'legacy_mock_key_999';
        break;
      default:
        apiKey = 'unknown_key';
    }
    
    const response = await axios.get(`${erp.url}/health`, { 
      timeout: 5000,
      headers: {
        'Authorization': apiKey
      }
    });
    
    console.log(`✅ ${erp.name} está respondendo:`, response.data.status);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${erp.name} não está rodando (conexão recusada)`);
    } else if (error.response?.status === 401) {
      console.log(`⚠️  ${erp.name} está rodando mas retornou 401 (Unauthorized)`);
      console.log(`   Headers recebidos:`, error.response.headers);
      console.log(`   Tentou usar chave: ${apiKey}`);
    } else if (error.response?.status) {
      console.log(`⚠️  ${erp.name} retornou status ${error.response.status}`);
    } else {
      console.log(`❌ ${erp.name} erro:`, error.message);
    }
    return false;
  }
}

// Função para testar middleware
async function testMiddleware() {
  try {
    console.log('🔍 Testando comunicação com Middleware...');
    
    const response = await axios.get(`${MIDDLEWARE_URL}/health`, { timeout: 5000 });
    console.log('✅ Middleware está respondendo:', response.data.status);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Middleware não está rodando (conexão recusada)');
    } else {
      console.log('❌ Middleware erro:', error.message);
    }
    return false;
  }
}

// Função para testar adição de sistema
async function testAddSystem() {
  try {
    console.log('\n🔍 Testando adição de sistema...');
    
    const testSystem = {
      id: 'test-system',
      name: 'Test System',
      baseUrl: 'http://localhost:3001',
      apiKey: 'test_key_123',
      timeout: 3000,
      priority: 1
    };
    
    const response = await axios.post(`${MIDDLEWARE_URL}/api/systems`, testSystem, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Sistema adicionado com sucesso:', response.data.message);
    return true;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('❌ Erro de validação:', error.response.data.error);
      console.log('   Detalhes:', error.response.data.details);
    } else if (error.response?.status === 409) {
      console.log('ℹ️  Sistema já existe (isso é normal)');
      return true;
    } else {
      console.log('❌ Erro ao adicionar sistema:', error.response?.data?.error || error.message);
    }
    return false;
  }
}

// Função principal
async function runTests() {
  console.log('🧪 Testando Comunicação do Sistema ERP Middleware');
  console.log('================================================\n');
  
  // 1. Testar middleware
  const middlewareOk = await testMiddleware();
  
  if (!middlewareOk) {
    console.log('\n❌ Middleware não está rodando. Execute primeiro: npm start');
    return;
  }
  
  // 2. Testar ERPs
  console.log('\n📡 Testando comunicação com ERPs Mock...');
  const erpResults = [];
  
  for (const erp of ERP_SYSTEMS) {
    const result = await testErpCommunication(erp);
    erpResults.push({ ...erp, ok: result });
    await sleep(1000); // Pequena pausa entre testes
  }
  
  // 3. Resumo dos ERPs
  console.log('\n📊 Resumo dos ERPs:');
  erpResults.forEach(erp => {
    const status = erp.ok ? '✅' : '❌';
    console.log(`   ${status} ${erp.name}: ${erp.url}`);
  });
  
  // 4. Testar adição de sistema
  if (erpResults.some(erp => erp.ok)) {
    await testAddSystem();
  }
  
  // 5. Recomendações
  console.log('\n💡 Recomendações:');
  
  if (!erpResults.some(erp => erp.ok)) {
    console.log('   • Nenhum ERP está rodando. Execute: node scripts/start-erp-mocks.js');
  } else if (erpResults.every(erp => erp.ok)) {
    console.log('   • Todos os ERPs estão funcionando! Execute: node scripts/setup-erp-mocks.js');
  } else {
    console.log('   • Alguns ERPs não estão funcionando. Verifique os logs acima.');
  }
  
  console.log('   • Para iniciar tudo: node scripts/start-complete-env.js');
}

// Executar testes
runTests().catch(console.error);
