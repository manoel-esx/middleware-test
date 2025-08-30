const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureAzureDevOps() {
  console.log('🚀 Configurando Git para Azure DevOps...\n');
  
  try {
    // Coletar informações do usuário
    const userName = await question('Digite seu nome completo: ');
    const userEmail = await question('Digite seu email corporativo: ');
    const organization = await question('Digite o nome da sua organização Azure DevOps: ');
    const project = await question('Digite o nome do projeto: ');
    const repository = await question('Digite o nome do repositório: ');
    
    console.log('\n📋 Configurando Git...');
    
    // Configurar usuário global
    execSync(`git config --global user.name "${userName}"`, { stdio: 'inherit' });
    execSync(`git config --global user.email "${userEmail}"`, { stdio: 'inherit' });
    
    console.log('✅ Usuário configurado com sucesso!');
    
    // Configurar helper de credenciais
    execSync('git config --global credential.helper store', { stdio: 'inherit' });
    console.log('✅ Helper de credenciais configurado!');
    
    // Configurar URL padrão para Azure DevOps
    execSync('git config --global url."https://dev.azure.com".insteadOf "git@ssh.dev.azure.com:"', { stdio: 'inherit' });
    console.log('✅ URL padrão configurada para Azure DevOps!');
    
    // Mostrar configurações
    console.log('\n📊 Configurações atuais:');
    execSync('git config --global --list | findstr user', { stdio: 'inherit' });
    
    console.log('\n🔗 Para conectar ao repositório, execute:');
    console.log(`git remote add origin https://dev.azure.com/${organization}/${project}/_git/${repository}`);
    
    console.log('\n🔑 IMPORTANTE:');
    console.log('1. Crie um Personal Access Token no Azure DevOps');
    console.log('2. Na primeira vez que fizer push, use:');
    console.log('   - Username: qualquer coisa');
    console.log('   - Password: seu Personal Access Token');
    
    console.log('\n✨ Configuração concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  } finally {
    rl.close();
  }
}

// Executar configuração
configureAzureDevOps();

