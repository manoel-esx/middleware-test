# API Middleware - Sistema de Roteamento Inteligente

Uma API middleware robusta em Node.js que serve como camada intermediária entre seu sistema e múltiplos sistemas externos, permitindo roteamento agnóstico e inteligente de requisições.

## 🚀 Características Principais

- **Roteamento Inteligente**: Múltiplas estratégias de roteamento (prioridade, round-robin, balanceamento de carga, failover)
- **Roteamento por ERP**: Roteamento automático baseado no ERP ID da requisição
- **Circuit Breaker**: Proteção automática contra falhas em cascata
- **Retry Automático**: Tentativas automáticas com backoff configurável
- **Monitoramento**: Sistema completo de logs e métricas
- **Escalabilidade**: Fácil adição/remoção de sistemas externos
- **Segurança**: Rate limiting, CORS, validação de entrada
- **Health Checks**: Monitoramento de saúde dos sistemas

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Seu Sistema   │───▶│  API Middleware  │───▶│Sistema Externo A│
│                 │    │                  │    │                 │
└─────────────────┘    │                  │    └─────────────────┘
                       │                  │    ┌─────────────────┐
                       │                  │───▶│Sistema Externo B│
                       │                  │    │                 │
                       │                  │    └─────────────────┘
                       │                  │    ┌─────────────────┐
                       │                  │───▶│Sistema Externo C│
                       └──────────────────┘    │                 │
                                              └─────────────────┘
```

## 🔄 Sistema de Roteamento por ERP

O middleware agora suporta roteamento automático baseado no ERP ID da requisição. Isso permite que diferentes ERPs sejam automaticamente direcionados para sistemas específicos sem alterar a estrutura dos dados.

### Como Funciona

1. **Header da Requisição**: Inclua o header `X-ERP-ID` com o ID do ERP
2. **Mapeamento Automático**: O middleware roteia automaticamente para o sistema configurado
3. **Fallback**: Se não houver mapeamento, usa a estratégia padrão

### Exemplo de Uso

```bash
# Requisição com ERP ID específico
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 123" \
  -d '{
    "empresaId": 1,
    "lojaId": 5
  }'
```

### Configuração de Mapeamentos

```bash
# Configurar ERP 123 para ir para o sistema A
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "123",
    "systemId": "system-a"
  }'

# Configurar ERP 456 para ir para o sistema B
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "456",
    "systemId": "system-b"
  }'
```

### Prioridades de Roteamento

1. **Sistema Específico**: `?targetSystem=system-a` (maior prioridade)
2. **ERP ID**: Header `X-ERP-ID` (segunda prioridade)
3. **Estratégia**: `?strategy=priority` (terceira prioridade)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd api-middleware
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute a aplicação:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Sistemas Externos
EXTERNAL_SYSTEM_A_URL=https://api.sistema-a.com
EXTERNAL_SYSTEM_A_API_KEY=sua_api_key_aqui
EXTERNAL_SYSTEM_A_TIMEOUT=5000

EXTERNAL_SYSTEM_B_URL=https://api.sistema-b.com
EXTERNAL_SYSTEM_B_API_KEY=sua_api_key_aqui
EXTERNAL_SYSTEM_B_TIMEOUT=5000

# Configurações de Retry e Circuit Breaker
MAX_RETRIES=3
RETRY_DELAY_MS=1000
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT_MS=60000
```

## 🔌 Uso da API

### 1. Roteamento de Requisições

#### GET - Leitura de dados
```bash
# Roteamento automático (estratégia padrão: prioridade)
GET /api/proxy/users?strategy=priority

# Para sistema específico
GET /api/proxy/users?targetSystem=system-a

# Com timeout personalizado
GET /api/proxy/users?timeout=10000&retry=false

# Roteamento por ERP ID (novo!)
GET /api/proxy/users
X-ERP-ID: 123
```

#### POST - Criação de dados
```bash
POST /api/proxy/users
Content-Type: application/json
X-ERP-ID: 123

{
  "name": "João Silva",
  "email": "joao@email.com"
}

# Com estratégia de balanceamento de carga
POST /api/proxy/users?strategy=load-balance
X-ERP-ID: 456

# Roteamento automático por ERP
POST /api/proxy/vendas/total-bruta
Content-Type: application/json
X-ERP-ID: 789

{
  "empresaId": 1,
  "lojaId": 5
}
```

#### PUT/PATCH - Atualização de dados
```bash
PUT /api/proxy/users/123
Content-Type: application/json
X-ERP-ID: 123

{
  "name": "João Silva Atualizado"
}

# Com estratégia de failover
PUT /api/proxy/users/123?strategy=failover
X-ERP-ID: 456
```

#### DELETE - Remoção de recursos
```bash
DELETE /api/proxy/users/123
X-ERP-ID: 123

# Para sistema específico com timeout
DELETE /api/proxy/users/123?targetSystem=system-b&timeout=8000
X-ERP-ID: 456
```

### 2. Estratégias de Roteamento

- **`priority`** (padrão): Roteia para o sistema com maior prioridade disponível
- **`round-robin`**: Distribui requisições entre sistemas de forma alternada
- **`load-balance`**: Seleciona o sistema com menor carga
- **`failover`**: Tenta sistemas em ordem de prioridade até encontrar um disponível

### 3. Roteamento por ERP ID

#### Configurar Mapeamento
```bash
# Listar todos os mapeamentos
GET /api/systems/erp-mappings

# Configurar ERP 123 para sistema A
POST /api/systems/erp-mappings
Content-Type: application/json

{
  "erpId": "123",
  "systemId": "system-a"
}

# Verificar mapeamento específico
GET /api/systems/erp-mappings/123

# Remover mapeamento
DELETE /api/systems/erp-mappings/123
```

#### Exemplos de Uso com ERP
```bash
# ERP 123 vai automaticamente para Sistema A
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 123" \
  -d '{"empresaId": 1, "lojaId": 5}'

# ERP 456 vai automaticamente para Sistema B
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 456" \
  -d '{"empresaId": 2, "lojaId": 10}'

# Sem ERP ID, usa estratégia padrão
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 3, "lojaId": 15}'
```

### 4. Gerenciamento de Sistemas

#### Listar todos os sistemas
```bash
GET /api/systems
```

#### Obter sistema específico
```bash
GET /api/systems/system-a
```

#### Habilitar/Desabilitar sistema
```bash
PUT /api/systems/system-a/enable
PUT /api/systems/system-a/disable
```

#### Atualizar prioridade
```bash
PUT /api/systems/system-a/priority
Content-Type: application/json

{
  "priority": 1
}
```

#### Adicionar novo sistema
```bash
POST /api/systems
Content-Type: application/json

{
  "id": "system-d",
  "name": "Sistema D",
  "baseUrl": "https://api.sistema-d.com",
  "apiKey": "nova_api_key",
  "timeout": 5000,
  "priority": 4
}
```

#### Remover sistema
```bash
DELETE /api/systems/system-d
```

### 4. Monitoramento de Saúde

#### Status geral
```bash
GET /api/health
```

#### Saúde de todos os sistemas
```bash
GET /api/health/systems
```

#### Saúde de sistema específico
```bash
GET /api/health/systems/system-a
```

#### Testar conectividade
```bash
POST /api/health/systems/system-a/test
```

## 📊 Estrutura de Resposta

### Resposta de Sucesso
```json
{
  "success": true,
  "data": {
    // Dados retornados pelo sistema externo
  },
  "metadata": {
    "system": "system-a",
    "status": 200,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "strategy": "priority"
  }
}
```

### Resposta de Erro
```json
{
  "error": "Mensagem de erro",
  "status": 500,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/proxy/users"
}
```

## 🔧 Circuit Breaker

O sistema implementa um Circuit Breaker com três estados:

- **CLOSED**: Sistema funcionando normalmente
- **OPEN**: Sistema com muitas falhas, requisições são bloqueadas
- **HALF_OPEN**: Sistema em teste para verificar se recuperou

### Configuração
```bash
CIRCUIT_BREAKER_THRESHOLD=5      # Número de falhas para abrir
CIRCUIT_BREAKER_TIMEOUT_MS=60000 # Tempo para tentar reabrir (ms)
```

## 📈 Métricas e Monitoramento

### Estatísticas dos Sistemas
```bash
GET /api/systems/stats/overview
```

Resposta:
```json
{
  "success": true,
  "data": {
    "totalSystems": 3,
    "enabledSystems": 2,
    "disabledSystems": 1,
    "systemsByStatus": {
      "CLOSED": 2,
      "OPEN": 0,
      "HALF_OPEN": 0
    },
    "totalRequests": 150,
    "totalFailures": 3
  }
}
```

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

- **200**: Sucesso
- **201**: Recurso criado
- **400**: Dados de entrada inválidos
- **404**: Sistema não encontrado
- **409**: Sistema já existe
- **500**: Erro interno do servidor
- **503**: Serviço indisponível

### Logs

Todos os eventos são logados com diferentes níveis:
- **INFO**: Requisições, respostas, operações normais
- **WARN**: Falhas não críticas, circuit breakers
- **ERROR**: Erros críticos, falhas de sistema

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📝 Exemplos de Uso

### 1. Migração Gradual

```bash
# Fase 1: Rotear 10% das requisições para novo sistema
GET /api/proxy/users?targetSystem=new-system&strategy=priority

# Fase 2: Balanceamento entre sistemas
GET /api/proxy/users?strategy=load-balance

# Fase 3: Failover automático
GET /api/proxy/users?strategy=failover
```

### 2. A/B Testing

```bash
# Testar sistema A
POST /api/proxy/orders?targetSystem=system-a

# Testar sistema B
POST /api/proxy/orders?targetSystem=system-b
```

### 3. Monitoramento em Tempo Real

```bash
# Verificar saúde a cada 30 segundos
watch -n 30 'curl -s http://localhost:3000/api/health | jq'
```

## 🔒 Segurança

- **Rate Limiting**: Proteção contra abuso
- **CORS**: Configurável para origens permitidas
- **Helmet**: Headers de segurança
- **Validação**: Validação rigorosa de entrada
- **Logs**: Auditoria completa de todas as operações

## 🚀 Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API em `/api/docs`
- Verifique os logs da aplicação

## 🔄 Changelog

### v1.0.0
- Sistema base de roteamento inteligente
- Circuit breaker implementado
- Múltiplas estratégias de roteamento
- Sistema completo de monitoramento
- API RESTful completa
- Documentação abrangente
