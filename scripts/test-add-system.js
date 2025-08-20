const axios = require('axios');

async function testAddSystem() {
  const testSystem = {
    id: 'test-sap',
    name: 'Test SAP',
    baseUrl: 'http://localhost:3001',
    apiKey: 'sap_mock_key_123',
    timeout: 3000,
    priority: 1
  };

  try {
    console.log('🔍 Testando adição de sistema...');
    console.log('Dados enviados:', JSON.stringify(testSystem, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/systems', testSystem, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Sistema adicionado com sucesso!');
    console.log('Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro ao adicionar sistema:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.error);
    console.log('Detalhes:', error.response?.data?.details);
    
    if (error.response?.data?.details) {
      console.log('\n🔍 Detalhes dos erros de validação:');
      error.response.data.details.forEach((detail, index) => {
        console.log(`   ${index + 1}. Campo: ${detail.path}`);
        console.log(`      Valor: ${detail.value}`);
        console.log(`      Mensagem: ${detail.msg}`);
        console.log(`      Tipo: ${detail.type}`);
      });
    }
  }
}

testAddSystem();
