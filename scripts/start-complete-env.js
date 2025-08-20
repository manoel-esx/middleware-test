const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

// Configurações
const MIDDLEWARE_PORT = 3000;
const MIDDLEWARE_URL = `http://localhost:${MIDDLEWARE_PORT}`;
const ERP_PORTS = [3001, 3002, 3003, 3004];

// Array para armazenar os processos
const processes = [];

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para verificar se uma porta está em uso
async function checkPort(port) {
  try {
    const response = await axios.get(`http://localhost:${port}/health`, { timeout: 1000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Função para aguardar uma porta ficar disponível
async function waitForPort(port, serviceName, maxAttempts = 30) {
  console.log(`⏳ Aguardando ${serviceName} na porta ${port}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkPort(port)) {
      console.log(`✅ ${serviceName} está rodando na porta ${port}`);
      return true;
    }
    await sleep(1000);
  }
  
  console.log(`❌ Timeout aguardando ${serviceName} na porta ${port}`);
  return false;
}

// Função para iniciar o middleware
function startMiddleware() {
  console.log('🚀 Iniciando API Middleware...');
  
  const process = spawn('node', ['src/server.js'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  
  process.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('Server running on port') || output.includes('listening on port')) {
      console.log('✅ Middleware iniciado com sucesso!');
    }
    console.log(`[Middleware] ${output}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[Middleware] ERRO: ${data.toString().trim()}`);
  });
  
  process.on('error', (error) => {
    console.error('❌ Erro ao iniciar middleware:', error);
  });
  
  return process;
}

// Função para iniciar um ERP mock
function startErpMock(erpName, scriptPath, port) {
  console.log(`🚀 Iniciando ${erpName} na porta ${port}...`);
  
  const process = spawn('node', [scriptPath], {
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  
  process.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('Server running on port') || output.includes('listening on port')) {
      console.log(`✅ ${erpName} iniciado com sucesso na porta ${port}!`);
    }
    console.log(`[${erpName}] ${output}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${erpName}] ERRO: ${data.toString().trim()}`);
  });
  
  process.on('error', (error) => {
    console.error(`❌ Erro ao iniciar ${erpName}:`, error);
  });
  
  return process;
}

// Função para configurar o sistema
async function setupSystem() {
  console.log('\n🔧 Configurando sistema...');
  
  try {
    // Aguardar middleware ficar saudável
    await waitForPort(MIDDLEWARE_PORT, 'Middleware', 60);
    
    // Aguardar todos os ERPs ficarem saudáveis
    for (let i = 0; i < ERP_PORTS.length; i++) {
      await waitForPort(ERP_PORTS[i], `ERP ${i + 1}`, 60);
    }
    
    console.log('\n✅ Todos os serviços estão rodando!');
    console.log('\n🔧 Executando configuração automática...');
    
    // Executar script de configuração
    const setupProcess = spawn('node', ['scripts/setup-erp-mocks.js'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    setupProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Ambiente completamente configurado e funcionando!');
        console.log('\n📊 Resumo dos serviços:');
        console.log(`   • Middleware: http://localhost:${MIDDLEWARE_PORT}`);
        console.log(`   • SAP ERP: http://localhost:${ERP_PORTS[0]}`);
        console.log(`   • Oracle ERP: http://localhost:${ERP_PORTS[1]}`);
        console.log(`   • Dynamics ERP: http://localhost:${ERP_PORTS[2]}`);
        console.log(`   • Legacy ERP: http://localhost:${ERP_PORTS[3]}`);
        console.log('\n🧪 Para testar, execute: node scripts/test-erp-routing.js');
        console.log('\n🛑 Para parar tudo, pressione Ctrl+C');
      } else {
        console.log(`\n❌ Erro na configuração (código: ${code})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
  }
}

// Função para parar todos os processos
function stopAllProcesses() {
  console.log('\n🛑 Parando todos os serviços...');
  
  processes.forEach((process) => {
    if (process && !process.killed) {
      process.kill('SIGTERM');
    }
  });
  
  // Aguardar um pouco e forçar parada se necessário
  setTimeout(() => {
    processes.forEach((process) => {
      if (process && !process.killed) {
        process.kill('SIGKILL');
      }
    });
    console.log('✅ Todos os serviços foram parados');
    process.exit(0);
  }, 3000);
}

// Função principal
async function startCompleteEnvironment() {
  console.log('🚀 Iniciando Ambiente Completo ERP Middleware');
  console.log('=============================================\n');
  
  try {
    // 1. Iniciar middleware
    const middlewareProcess = startMiddleware();
    processes.push(middlewareProcess);
    
    // Aguardar middleware inicializar
    await sleep(3000);
    
    // 2. Iniciar ERPs mock
    const erpScripts = [
      { name: 'SAP ERP', script: 'mocks/sap-erp-server.js', port: 3001 },
      { name: 'Oracle ERP', script: 'mocks/oracle-erp-server.js', port: 3002 },
      { name: 'Microsoft Dynamics ERP', script: 'mocks/dynamics-erp-server.js', port: 3003 },
      { name: 'Legacy ERP', script: 'mocks/legacy-erp-server.js', port: 3004 }
    ];
    
    erpScripts.forEach((erp) => {
      const process = startErpMock(erp.name, erp.script, erp.port);
      processes.push(process);
    });
    
    // 3. Configurar sistema automaticamente
    setTimeout(() => {
      setupSystem();
    }, 5000);
    
    // Capturar Ctrl+C para parar tudo
    process.on('SIGINT', stopAllProcesses);
    process.on('SIGTERM', stopAllProcesses);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar ambiente:', error);
    stopAllProcesses();
  }
}

// Iniciar ambiente
startCompleteEnvironment();
