# Script PowerShell para build e push das imagens para Docker Hub
# Uso: .\scripts\docker-push.ps1 [username] [tag]

param(
    [string]$Username = "seu-usuario-aqui",
    [string]$Tag = "latest"
)

# Configurações
$ErrorActionPreference = "Stop"

Write-Host "🐳 Docker Hub Push Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Username: $Username" -ForegroundColor Yellow
Write-Host "Tag: $Tag" -ForegroundColor Yellow
Write-Host ""

# Verificar se está logado no Docker Hub
try {
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -match "Username: (.+)") {
        $loggedUser = $matches[1]
        Write-Host "✅ Logado no Docker Hub como: $loggedUser" -ForegroundColor Green
    } else {
        Write-Host "❌ Você não está logado no Docker Hub" -ForegroundColor Red
        Write-Host "Execute: docker login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar login do Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Função para build e push de uma imagem
function Build-And-Push {
    param(
        [string]$ServiceName,
        [string]$DockerfilePath
    )
    
    $imageName = "$Username/$ServiceName`:$Tag"
    
    Write-Host "🔨 Buildando $ServiceName..." -ForegroundColor Blue
    try {
        if ($DockerfilePath -eq ".") {
            docker build -t $imageName .
        } else {
            $contextPath = Split-Path $DockerfilePath -Parent
            docker build -t $imageName -f $DockerfilePath $contextPath
        }
        
        Write-Host "📤 Fazendo push de $imageName..." -ForegroundColor Blue
        docker push $imageName
        
        Write-Host "✅ $ServiceName enviado com sucesso!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Erro ao processar $ServiceName: $_" -ForegroundColor Red
        throw
    }
}

# Build e push de todas as imagens
Write-Host "🚀 Iniciando build e push de todas as imagens..." -ForegroundColor Cyan
Write-Host ""

try {
    # 1. API Middleware
    Build-And-Push "api-middleware" "."
    
    # 2. SAP ERP Mock
    Build-And-Push "sap-erp-mock" "mocks\Dockerfile.sap"
    
    # 3. Oracle ERP Mock
    Build-And-Push "oracle-erp-mock" "mocks\Dockerfile.oracle"
    
    # 4. Microsoft Dynamics ERP Mock
    Build-And-Push "dynamics-erp-mock" "mocks\Dockerfile.dynamics"
    
    # 5. Legacy ERP Mock
    Build-And-Push "legacy-erp-mock" "mocks\Dockerfile.legacy"
    
    # 6. ERP Setup
    Build-And-Push "erp-setup" "Dockerfile.setup"
    
    Write-Host "🎉 Todas as imagens foram enviadas com sucesso para Docker Hub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Resumo das imagens enviadas:" -ForegroundColor Cyan
    Write-Host "   • $Username/api-middleware:$Tag" -ForegroundColor White
    Write-Host "   • $Username/sap-erp-mock:$Tag" -ForegroundColor White
    Write-Host "   • $Username/oracle-erp-mock:$Tag" -ForegroundColor White
    Write-Host "   • $Username/dynamics-erp-mock:$Tag" -ForegroundColor White
    Write-Host "   • $Username/legacy-erp-mock:$Tag" -ForegroundColor White
    Write-Host "   • $Username/erp-setup:$Tag" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Para usar, atualize o docker.env com:" -ForegroundColor Yellow
    Write-Host "   DOCKER_USERNAME=$Username" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Ou execute: docker-compose --env-file docker.env up -d" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Erro durante o processo: $_" -ForegroundColor Red
    exit 1
}
