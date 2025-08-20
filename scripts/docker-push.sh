#!/bin/bash

# Script para build e push das imagens para Docker Hub
# Uso: ./scripts/docker-push.sh [username] [tag]

set -e

# Configurações
DEFAULT_USERNAME="seu-usuario-aqui"
DEFAULT_TAG="latest"

# Obter username e tag dos argumentos ou usar padrões
USERNAME=${1:-$DEFAULT_USERNAME}
TAG=${2:-$DEFAULT_TAG}

echo "🐳 Docker Hub Push Script"
echo "========================="
echo "Username: $USERNAME"
echo "Tag: $TAG"
echo ""

# Verificar se está logado no Docker Hub
if ! docker info | grep -q "Username"; then
    echo "❌ Você não está logado no Docker Hub"
    echo "Execute: docker login"
    exit 1
fi

echo "✅ Logado no Docker Hub como: $(docker info | grep 'Username' | awk '{print $2}')"
echo ""

# Função para build e push de uma imagem
build_and_push() {
    local service_name=$1
    local dockerfile_path=$2
    local image_name="$USERNAME/$service_name:$TAG"
    
    echo "🔨 Buildando $service_name..."
    if [ "$dockerfile_path" = "." ]; then
        docker build -t "$image_name" .
    else
        docker build -t "$image_name" -f "$dockerfile_path" "$(dirname "$dockerfile_path")"
    fi
    
    echo "📤 Fazendo push de $image_name..."
    docker push "$image_name"
    
    echo "✅ $service_name enviado com sucesso!"
    echo ""
}

# Build e push de todas as imagens
echo "🚀 Iniciando build e push de todas as imagens..."
echo ""

# 1. API Middleware
build_and_push "api-middleware" "."

# 2. SAP ERP Mock
build_and_push "sap-erp-mock" "mocks/Dockerfile.sap"

# 3. Oracle ERP Mock
build_and_push "oracle-erp-mock" "mocks/Dockerfile.oracle"

# 4. Microsoft Dynamics ERP Mock
build_and_push "dynamics-erp-mock" "mocks/Dockerfile.dynamics"

# 5. Legacy ERP Mock
build_and_push "legacy-erp-mock" "mocks/Dockerfile.legacy"

# 6. ERP Setup
build_and_push "erp-setup" "Dockerfile.setup"

echo "🎉 Todas as imagens foram enviadas com sucesso para Docker Hub!"
echo ""
echo "📋 Resumo das imagens enviadas:"
echo "   • $USERNAME/api-middleware:$TAG"
echo "   • $USERNAME/sap-erp-mock:$TAG"
echo "   • $USERNAME/oracle-erp-mock:$TAG"
echo "   • $USERNAME/dynamics-erp-mock:$TAG"
echo "   • $USERNAME/legacy-erp-mock:$TAG"
echo "   • $USERNAME/erp-setup:$TAG"
echo ""
echo "🔗 Para usar, atualize o docker-compose.yml com:"
echo "   DOCKER_USERNAME=$USERNAME"
echo ""
echo "💡 Ou execute: docker-compose --env-file docker.env up -d"
