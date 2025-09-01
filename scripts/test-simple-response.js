const axios = require('axios');

async function testSimpleResponse() {
  try {
    console.log('🧪 Testando nova resposta simplificada...\n');
    
    const response = await axios.post('http://localhost:3000/api/loja/verificar-bloqueio-vg', {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta recebida:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📊 Estrutura da resposta:');
    console.log(`   resultado: ${Array.isArray(response.data.resultado) ? 'array' : typeof response.data.resultado}`);
    console.log(`   quantidade de IDs: ${response.data.resultado?.length || 0}`);
    console.log(`   IDs: ${response.data.resultado?.join(', ') || 'nenhum'}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSimpleResponse();
