#!/bin/bash

# Script de inicialização rápida para API Middleware
# Uso: ./start.sh [dev|prod|docker]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Por favor, instale o Node.js 16+ primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js versão 16+ é necessário. Versão atual: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detectado"
}

# Função para verificar se o npm está instalado
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado. Por favor, instale o npm primeiro."
        exit 1
    fi
    
    print_success "npm $(npm -v) detectado"
}

# Função para instalar dependências
install_dependencies() {
    print_message "Instalando dependências..."
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependências instaladas com sucesso"
    else
        print_message "Dependências já instaladas, pulando..."
    fi
}

# Função para criar arquivo .env se não existir
setup_env() {
    if [ ! -f ".env" ]; then
        print_message "Arquivo .env não encontrado, criando a partir do template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Arquivo .env criado. Por favor, edite-o com suas configurações antes de continuar."
            print_message "Pressione Enter para continuar ou Ctrl+C para editar o arquivo primeiro..."
            read -r
        else
            print_error "Arquivo env.example não encontrado. Criando .env básico..."
            cat > .env << EOF
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações de Log
LOG_LEVEL=info

# Configure seus sistemas externos aqui
EXTERNAL_SYSTEM_A_URL=https://api.sistema-a.com
EXTERNAL_SYSTEM_A_API_KEY=your_api_key_here
EXTERNAL_SYSTEM_A_TIMEOUT=5000
EOF
            print_warning "Arquivo .env básico criado. Por favor, edite-o com suas configurações."
        fi
    fi
}

# Função para criar diretório de logs
setup_logs() {
    if [ ! -d "logs" ]; then
        print_message "Criando diretório de logs..."
        mkdir -p logs
        print_success "Diretório de logs criado"
    fi
}

# Função para iniciar em modo desenvolvimento
start_dev() {
    print_message "Iniciando em modo desenvolvimento..."
    npm run dev
}

# Função para iniciar em modo produção
start_prod() {
    print_message "Iniciando em modo produção..."
    npm start
}

# Função para iniciar com Docker
start_docker() {
    print_message "Verificando se o Docker está instalado..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    print_success "Docker $(docker --version) detectado"
    print_success "Docker Compose $(docker-compose --version) detectado"
    
    print_message "Iniciando com Docker Compose..."
    docker-compose up --build
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  dev     Iniciar em modo desenvolvimento (padrão)"
    echo "  prod    Iniciar em modo produção"
    echo "  docker  Iniciar com Docker Compose"
    echo "  help    Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0        # Inicia em modo desenvolvimento"
    echo "  $0 prod   # Inicia em modo produção"
    echo "  $0 docker # Inicia com Docker"
}

# Função principal
main() {
    local mode=${1:-dev}
    
    print_message "🚀 Iniciando API Middleware..."
    echo ""
    
    case $mode in
        "dev"|"development")
            check_node
            check_npm
            install_dependencies
            setup_env
            setup_logs
            start_dev
            ;;
        "prod"|"production")
            check_node
            check_npm
            install_dependencies
            setup_env
            setup_logs
            start_prod
            ;;
        "docker")
            start_docker
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            print_error "Modo inválido: $mode"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
