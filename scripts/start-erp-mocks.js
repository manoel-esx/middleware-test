const { spawn } = require('child_process');
const path = require('path');

// Configuração dos ERPs mock
const ERP_MOCKS = [
  {
    name: 'SAP ERP',
    script: path.join(__dirname, '../mocks/sap-erp-server.js'),
    port: 3001
  },
  {
    name: 'Oracle ERP',
    script: path.join(__dirname, '../mocks/oracle-erp-server.js'),
    port: 3002
  },
  {
    name: 'Microsoft Dynamics ERP',
    script: path.join(__dirname, '../mocks/dynamics-erp-server.js'),
    port: 3003
  },
  {
    name: 'Legacy ERP',
    script: path.join(__dirname, '../mocks/legacy-erp-server.js'),
    port: 3004
  }
];

// Array para armazenar os processos
const processes = [];

// Função para iniciar um ERP mock
function startErpMock(erpMock) {
  console.log(`🚀 Iniciando ${erpMock.name} na porta ${erpMock.port}...`);
  
  const process = spawn('node', [erpMock.script], {
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  
  // Capturar saída padrão
  process.stdout.on('data', (data) => {
    console.log(`[${erpMock.name}] ${data.toString().trim()}`);
  });
  
  // Capturar erros
  process.stderr.on('data', (data) => {
    console.error(`[${erpMock.name}] ERRO: ${data.toString().trim()}`);
  });
  
  // Capturar quando o processo termina
  process.on('close', (code) => {
    console.log(`[${erpMock.name}] Processo finalizado com código ${code}`);
  });
  
  // Capturar erros do processo
  process.on('error', (error) => {
    console.error(`[${erpMock.name}] Erro ao iniciar processo:`, error);
  });
  
  return process;
}

// Função para parar todos os processos
function stopAllProcesses() {
  console.log('\n🛑 Parando todos os ERPs mock...');
  
  processes.forEach((process, index) => {
    if (process && !process.killed) {
      console.log(`Parando ${ERP_MOCKS[index].name}...`);
      process.kill('SIGTERM');
    }
  });
  
  // Aguardar um pouco e forçar parada se necessário
  setTimeout(() => {
    processes.forEach((process, index) => {
      if (process && !process.killed) {
        console.log(`Forçando parada de ${ERP_MOCKS[index].name}...`);
        process.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 3000);
}

// Função principal
function startAllErpMocks() {
  console.log('🚀 Iniciando todos os ERPs Mock para testes...\n');
  
  // Iniciar cada ERP mock
  ERP_MOCKS.forEach((erpMock) => {
    const process = startErpMock(erpMock);
    processes.push(process);
    
    // Pequena pausa entre inícios
    setTimeout(() => {}, 1000);
  });
  
  console.log('\n✅ Todos os ERPs mock foram iniciados!');
  console.log('\n📊 Resumo dos ERPs rodando:');
  ERP_MOCKS.forEach((erpMock) => {
    console.log(`   • ${erpMock.name}: http://localhost:${erpMock.port}`);
  });
  
  console.log('\n🔍 Para verificar se estão funcionando:');
  ERP_MOCKS.forEach((erpMock) => {
    console.log(`   curl http://localhost:${erpMock.port}/health`);
  });
  
  console.log('\n⏹️  Pressione Ctrl+C para parar todos os ERPs mock');
  console.log('\n💡 Dica: Em outro terminal, execute:');
  console.log('   node scripts/setup-erp-mocks.js');
  
  // Configurar handlers para parada graciosa
  process.on('SIGINT', stopAllProcesses);
  process.on('SIGTERM', stopAllProcesses);
}

// Executar se chamado diretamente
if (require.main === module) {
  startAllErpMocks();
}

module.exports = { startAllErpMocks, stopAllProcesses };
