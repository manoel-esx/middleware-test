const axios = require('axios');

// Configuração
const MIDDLEWARE_URL = 'http://localhost:3000';
const TEST_CASES = [
  {
    name: 'ERP 123 -> SAP',
    erpId: '123',
    expectedSystem: 'sap-erp',
    description: 'Testa roteamento do ERP 123 para o sistema SAP'
  },
  {
    name: 'ERP 456 -> Oracle',
    erpId: '456',
    expectedSystem: 'oracle-erp',
    description: 'Testa roteamento do ERP 456 para o sistema Oracle'
  },
  {
    name: 'ERP 789 -> Microsoft Dynamics',
    erpId: '789',
    expectedSystem: 'dynamics-erp',
    description: 'Testa roteamento do ERP 789 para o Microsoft Dynamics'
  },
  {
    name: 'ERP 999 -> Legacy',
    erpId: '999',
    expectedSystem: 'legacy-erp',
    description: 'Testa roteamento do ERP 999 para o sistema Legacy'
  },
  {
    name: 'Sem ERP ID (Estratégia padrão)',
    erpId: null,
    expectedSystem: 'sap-erp', // Deve ir para o de maior prioridade
    description: 'Testa roteamento sem ERP ID usando estratégia padrão'
  }
];

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para testar um caso específico
async function testCase(testCase) {
  console.log(`\n🧪 Testando: ${testCase.name}`);
  console.log(`   ${testCase.description}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (testCase.erpId) {
      headers['X-ERP-ID'] = testCase.erpId;
    }
    
    const startTime = Date.now();
    
    const response = await axios.post(
      `${MIDDLEWARE_URL}/api/proxy/vendas/total-bruta`,
      {
        empresaId: Math.floor(Math.random() * 10) + 1,
        lojaId: Math.floor(Math.random() * 20) + 1
      },
      { headers }
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Verificar se a resposta é válida
    if (response.status === 200 && response.data.success) {
      const actualSystem = response.data.metadata.system;
      const routingMethod = response.data.metadata.routingMethod;
      const erpId = response.data.metadata.erpId;
      
      console.log(`   ✅ Sucesso!`);
      console.log(`      Sistema usado: ${actualSystem}`);
      console.log(`      Método de roteamento: ${routingMethod}`);
      console.log(`      ERP ID: ${erpId || 'N/A'}`);
      console.log(`      Tempo de resposta: ${responseTime}ms`);
      
      // Verificar se foi para o sistema esperado
      if (actualSystem === testCase.expectedSystem) {
        console.log(`      🎯 Sistema correto!`);
        return { success: true, system: actualSystem, responseTime };
      } else {
        console.log(`      ⚠️  Sistema incorreto. Esperado: ${testCase.expectedSystem}, Obtido: ${actualSystem}`);
        return { success: false, system: actualSystem, expected: testCase.expectedSystem, responseTime };
      }
    } else {
      console.log(`   ❌ Resposta inválida:`, response.status, response.data);
      return { success: false, error: 'Resposta inválida' };
    }
    
  } catch (error) {
    console.log(`   ❌ Erro:`, error.response?.data?.error || error.message);
    return { success: false, error: error.message };
  }
}

// Função para testar estratégias de roteamento
async function testRoutingStrategies() {
  console.log(`\n🔄 Testando estratégias de roteamento...`);
  
  const strategies = ['priority', 'round-robin', 'load-balance', 'failover'];
  const results = [];
  
  for (const strategy of strategies) {
    try {
      console.log(`\n   🎯 Testando estratégia: ${strategy}`);
      
      const startTime = Date.now();
      
      const response = await axios.post(
        `${MIDDLEWARE_URL}/api/proxy/vendas/total-bruta?strategy=${strategy}`,
        {
          empresaId: Math.floor(Math.random() * 10) + 1,
          lojaId: Math.floor(Math.random() * 20) + 1
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.status === 200 && response.data.success) {
        const system = response.data.metadata.system;
        console.log(`      ✅ Sistema usado: ${system}`);
        console.log(`      Tempo: ${responseTime}ms`);
        results.push({ strategy, success: true, system, responseTime });
      } else {
        console.log(`      ❌ Falhou`);
        results.push({ strategy, success: false });
      }
      
      await sleep(500); // Pausa entre testes
      
    } catch (error) {
      console.log(`      ❌ Erro:`, error.response?.data?.error || error.message);
      results.push({ strategy, success: false, error: error.message });
    }
  }
  
  return results;
}

// Função para testar circuit breaker
async function testCircuitBreaker() {
  console.log(`\n🔌 Testando circuit breaker...`);
  
  try {
    // Fazer várias requisições para o mesmo sistema para testar circuit breaker
    console.log(`   🔄 Fazendo múltiplas requisições para testar circuit breaker...`);
    
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.post(
          `${MIDDLEWARE_URL}/api/proxy/vendas/total-bruta?targetSystem=sap-erp`,
          {
            empresaId: 1,
            lojaId: 1
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        ).catch(err => ({ error: err.message }))
      );
      
      await sleep(100); // Pequena pausa entre requisições
    }
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => !r.error).length;
    const errorCount = responses.filter(r => r.error).length;
    
    console.log(`      ✅ Requisições bem-sucedidas: ${successCount}`);
    console.log(`      ❌ Requisições com erro: ${errorCount}`);
    
    return { success: true, successCount, errorCount };
    
  } catch (error) {
    console.log(`   ❌ Erro ao testar circuit breaker:`, error.message);
    return { success: false, error: error.message };
  }
}

// Função principal
async function runAllTests() {
  console.log('🧪 Iniciando testes completos do sistema de roteamento por ERP...\n');
  
  // Verificar se o middleware está rodando
  try {
    await axios.get(`${MIDDLEWARE_URL}/health`);
    console.log('✅ Middleware está rodando');
  } catch (error) {
    console.log('❌ Middleware não está rodando. Execute primeiro: npm start');
    return;
  }
  
  // Verificar se os sistemas estão configurados
  try {
    const systemsResponse = await axios.get(`${MIDDLEWARE_URL}/api/systems`);
    const systems = systemsResponse.data.data || [];
    
    if (systems.length === 0) {
      console.log('❌ Nenhum sistema configurado. Execute primeiro: node scripts/setup-erp-mocks.js');
      return;
    }
    
    console.log(`✅ ${systems.length} sistemas configurados`);
  } catch (error) {
    console.log('❌ Erro ao verificar sistemas:', error.message);
    return;
  }
  
  // Executar testes de roteamento por ERP
  console.log('\n📋 Testando roteamento por ERP ID...');
  const erpResults = [];
  
  for (const testCase of TEST_CASES) {
    const result = await testCase(testCase);
    erpResults.push({ ...testCase, result });
    await sleep(1000); // Pausa entre testes
  }
  
  // Executar testes de estratégias
  const strategyResults = await testRoutingStrategies();
  
  // Executar testes de circuit breaker
  const circuitBreakerResults = await testCircuitBreaker();
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('====================');
  
  console.log('\n🎯 Roteamento por ERP ID:');
  const erpSuccessCount = erpResults.filter(r => r.result.success).length;
  console.log(`   ✅ Sucessos: ${erpSuccessCount}/${erpResults.length}`);
  
  erpResults.forEach(result => {
    const status = result.result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}: ${result.result.system || result.result.error}`);
  });
  
  console.log('\n🔄 Estratégias de Roteamento:');
  const strategySuccessCount = strategyResults.filter(r => r.success).length;
  console.log(`   ✅ Sucessos: ${strategySuccessCount}/${strategyResults.length}`);
  
  strategyResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.strategy}: ${result.system || result.error || 'Falhou'}`);
  });
  
  console.log('\n🔌 Circuit Breaker:');
  if (circuitBreakerResults.success) {
    console.log(`   ✅ Teste concluído: ${circuitBreakerResults.successCount} sucessos, ${circuitBreakerResults.errorCount} erros`);
  } else {
    console.log(`   ❌ Teste falhou: ${circuitBreakerResults.error}`);
  }
  
  // Estatísticas gerais
  const totalTests = erpResults.length + strategyResults.length + 1;
  const totalSuccess = erpSuccessCount + strategySuccessCount + (circuitBreakerResults.success ? 1 : 0);
  
  console.log('\n📈 ESTATÍSTICAS GERAIS');
  console.log('========================');
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   Sucessos: ${totalSuccess}`);
  console.log(`   Falhas: ${totalTests - totalSuccess}`);
  console.log(`   Taxa de sucesso: ${((totalSuccess / totalTests) * 100).toFixed(1)}%`);
  
  if (totalSuccess === totalTests) {
    console.log('\n🎉 Todos os testes passaram! O sistema está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima para mais detalhes.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testCase, testRoutingStrategies, testCircuitBreaker };
