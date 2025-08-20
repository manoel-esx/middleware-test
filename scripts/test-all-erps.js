const axios = require('axios');

const ERP_CONFIGS = [
  { id: '123', name: 'SAP', port: 3001, apiKey: 'sap_mock_key_123' },
  { id: '456', name: 'Oracle', port: 3002, apiKey: 'oracle_mock_key_456' },
  { id: '789', name: 'Dynamics', port: 3003, apiKey: 'dynamics_mock_key_789' },
  { id: '999', name: 'Legacy', port: 3004, apiKey: 'legacy_mock_key_999' }
];

async function testErpDirectly(erp) {
  console.log(`\n🔍 Testando ${erp.name} diretamente na porta ${erp.port}...`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`http://localhost:${erp.port}/vendas/total-bruta`, {
      empresaId: 1,
      lojaId: 2
    }, {
      headers: {
        'Authorization': erp.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ ${erp.name} - Tempo: ${responseTime}ms`);
    console.log(`   💰 Total: R$ ${response.data.totalVendaBruta.toLocaleString()}`);
    console.log(`   💳 À Vista: R$ ${response.data.detalhes.vendasAVista.toLocaleString()}`);
    console.log(`   📅 A Prazo: R$ ${response.data.detalhes.vendasAPrazo.toLocaleString()}`);
    console.log(`   🏷️  Desconto: R$ ${response.data.detalhes.descontoTotal.toLocaleString()}`);
    console.log(`   📊 Sistema: ${response.data.sistema}`);
    
    return { success: true, data: response.data, time: responseTime };
  } catch (error) {
    console.log(`❌ ${erp.name} - Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testErpViaMiddleware(erp) {
  console.log(`\n🔄 Testando ${erp.name} via middleware (ERP ID: ${erp.id})...`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:3000/api/proxy/vendas/total-bruta', {
      empresaId: 1,
      lojaId: 2,
      erpId: parseInt(erp.id)
    }, {
      headers: {
        'X-ERP-ID': erp.id,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ ${erp.name} via Middleware - Tempo: ${responseTime}ms`);
    console.log(`   💰 Total: R$ ${response.data.data.totalVendaBruta.toLocaleString()}`);
    console.log(`   🎯 Sistema Destino: ${response.data.metadata.system}`);
    console.log(`   🛣️  Método Roteamento: ${response.data.metadata.routingMethod}`);
    console.log(`   📍 ERP ID: ${response.data.metadata.erpId}`);
    
    return { success: true, data: response.data, time: responseTime };
  } catch (error) {
    console.log(`❌ ${erp.name} via Middleware - Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de todos os ERPs...\n');
  
  const results = {
    direct: [],
    middleware: []
  };
  
  // Teste 1: Direto nos ERPs
  console.log('📡 TESTE 1: Comunicação direta com ERPs');
  console.log('=' .repeat(50));
  
  for (const erp of ERP_CONFIGS) {
    const result = await testErpDirectly(erp);
    results.direct.push({ erp: erp.name, ...result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre testes
  }
  
  // Teste 2: Via Middleware
  console.log('\n🔄 TESTE 2: Via Middleware com roteamento por ERP ID');
  console.log('=' .repeat(50));
  
  for (const erp of ERP_CONFIGS) {
    const result = await testErpViaMiddleware(erp);
    results.middleware.push({ erp: erp.name, ...result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre testes
  }
  
  // Resumo
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('=' .repeat(50));
  
  console.log('\n🎯 Comunicação Direta:');
  results.direct.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.erp}: ${result.time}ms`);
    } else {
      console.log(`   ❌ ${result.erp}: ${result.error}`);
    }
  });
  
  console.log('\n🔄 Via Middleware:');
  results.middleware.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.erp}: ${result.time}ms`);
    } else {
      console.log(`   ❌ ${result.erp}: ${result.error}`);
    }
  });
  
  // Estatísticas
  const directSuccess = results.direct.filter(r => r.success).length;
  const middlewareSuccess = results.middleware.filter(r => r.success).length;
  
  console.log(`\n📈 Taxa de Sucesso:`);
  console.log(`   Direto: ${directSuccess}/4 (${(directSuccess/4*100).toFixed(1)}%)`);
  console.log(`   Middleware: ${middlewareSuccess}/4 (${(middlewareSuccess/4*100).toFixed(1)}%)`);
  
  console.log('\n✨ Testes concluídos!');
}

// Executar testes
runTests().catch(console.error);
