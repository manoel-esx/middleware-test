# Exemplos Práticos de Uso da API Middleware

Este documento contém exemplos práticos de como usar a API Middleware em diferentes cenários reais.

## 🏢 Cenário: Sistema de E-commerce

Imagine que você tem um sistema de e-commerce que precisa se comunicar com múltiplos provedores de pagamento e sistemas de estoque.

### 1. Configuração Inicial

```bash
# Adicionar sistema de pagamento principal
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "stripe",
    "name": "Stripe Payment",
    "baseUrl": "https://api.stripe.com/v1",
    "apiKey": "sk_test_...",
    "timeout": 5000,
    "priority": 1
  }'

# Adicionar sistema de pagamento alternativo
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "paypal",
    "name": "PayPal Payment",
    "baseUrl": "https://api.paypal.com/v1",
    "apiKey": "A21AA...",
    "timeout": 8000,
    "priority": 2
  }'

# Adicionar sistema de estoque
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "inventory",
    "name": "Inventory System",
    "baseUrl": "https://inventory.company.com/api",
    "apiKey": "inv_key_...",
    "timeout": 3000,
    "priority": 1
  }'
```

### 2. Processamento de Pagamentos

#### Pagamento com Failover Automático
```bash
# Se Stripe falhar, automaticamente tenta PayPal
curl -X POST http://localhost:3000/api/proxy/payment_intents \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "payment_method_types": ["card"]
  }' \
  -G \
  -d "strategy=failover"
```

#### Pagamento para Sistema Específico
```bash
# Forçar uso do PayPal
curl -X POST http://localhost:3000/api/proxy/payment_intents \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "payment_method_types": ["card"]
  }' \
  -G \
  -d "targetSystem=paypal"
```

### 3. Verificação de Estoque

#### Balanceamento de Carga
```bash
# Distribuir requisições entre sistemas de estoque
curl -X GET "http://localhost:3000/api/proxy/products/123/stock" \
  -G \
  -d "strategy=load-balance"
```

## 🏥 Cenário: Sistema de Saúde

Imagine um sistema que precisa se comunicar com múltiplos laboratórios e hospitais.

### 1. Configuração dos Sistemas

```bash
# Laboratório principal
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lab-central",
    "name": "Laboratório Central",
    "baseUrl": "https://lab-central.com/api",
    "apiKey": "lab_key_...",
    "timeout": 10000,
    "priority": 1
  }'

# Laboratório de backup
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lab-backup",
    "name": "Laboratório de Backup",
    "baseUrl": "https://lab-backup.com/api",
    "apiKey": "backup_key_...",
    "timeout": 15000,
    "priority": 2
  }'

# Hospital principal
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "hospital-main",
    "name": "Hospital Principal",
    "baseUrl": "https://hospital-main.com/api",
    "apiKey": "hosp_key_...",
    "timeout": 8000,
    "priority": 1
  }'
```

### 2. Solicitação de Exames

#### Round-Robin para Distribuir Carga
```bash
# Alternar entre laboratórios
curl -X POST http://localhost:3000/api/proxy/exams \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "12345",
    "examType": "blood_test",
    "priority": "urgent"
  }' \
  -G \
  -d "strategy=round-robin"
```

#### Prioridade para Casos Urgentes
```bash
# Sempre usar o laboratório principal para casos urgentes
curl -X POST http://localhost:3000/api/proxy/exams \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "12345",
    "examType": "blood_test",
    "priority": "urgent"
  }' \
  -G \
  -d "strategy=priority"
```

## 🏦 Cenário: Sistema Bancário

Imagine um sistema que precisa se comunicar com múltiplas APIs de diferentes bancos.

### 1. Configuração dos Bancos

```bash
# Banco principal
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "banco-principal",
    "name": "Banco Principal",
    "baseUrl": "https://api.banco-principal.com",
    "apiKey": "banco_key_...",
    "timeout": 5000,
    "priority": 1
  }'

# Banco secundário
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "banco-secundario",
    "name": "Banco Secundário",
    "baseUrl": "https://api.banco-secundario.com",
    "apiKey": "sec_key_...",
    "timeout": 6000,
    "priority": 2
  }'
```

### 2. Consulta de Saldo

#### Failover para Disponibilidade
```bash
# Se o banco principal estiver indisponível, tenta o secundário
curl -X GET "http://localhost:3000/api/proxy/accounts/12345/balance" \
  -G \
  -d "strategy=failover"
```

## 📊 Monitoramento e Operações

### 1. Verificar Saúde dos Sistemas

```bash
# Status geral
curl http://localhost:3000/api/health

# Status detalhado de todos os sistemas
curl http://localhost:3000/api/health/systems

# Status de um sistema específico
curl http://localhost:3000/api/health/systems/stripe

# Testar conectividade
curl -X POST http://localhost:3000/api/health/systems/stripe/test
```

### 2. Gerenciar Sistemas

```bash
# Listar todos os sistemas
curl http://localhost:3000/api/systems

# Desabilitar sistema temporariamente
curl -X PUT http://localhost:3000/api/systems/stripe/disable

# Alterar prioridade
curl -X PUT http://localhost:3000/api/systems/paypal/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": 1}'

# Remover sistema
curl -X DELETE http://localhost:3000/api/systems/lab-backup
```

### 3. Estatísticas e Métricas

```bash
# Visão geral das estatísticas
curl http://localhost:3000/api/systems/stats/overview
```

## 🔄 Cenários de Migração

### 1. Migração Gradual de Sistema

```bash
# Fase 1: 10% das requisições para novo sistema
# (Implementar lógica no seu sistema para rotear baseado em ID ou hash)

# Fase 2: 50% das requisições
curl -X GET "http://localhost:3000/api/proxy/users" \
  -G \
  -d "strategy=load-balance"

# Fase 3: 100% das requisições
curl -X GET "http://localhost:3000/api/proxy/users" \
  -G \
  -d "strategy=priority"
```

### 2. A/B Testing

```bash
# Testar sistema A
curl -X POST http://localhost:3000/api/proxy/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": "123", "quantity": 1}' \
  -G \
  -d "targetSystem=system-a"

# Testar sistema B
curl -X POST http://localhost:3000/api/proxy/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": "123", "quantity": 1}' \
  -G \
  -d "targetSystem=system-b"
```

## 🚨 Cenários de Emergência

### 1. Sistema Principal Indisponível

```bash
# Verificar status
curl http://localhost:3000/api/health/systems/stripe

# Se estiver com circuit breaker aberto, desabilitar temporariamente
curl -X PUT http://localhost:3000/api/systems/stripe/disable

# Todas as requisições irão automaticamente para o sistema de backup
curl -X POST http://localhost:3000/api/proxy/payment_intents \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "usd"}' \
  -G \
  -d "strategy=failover"
```

### 2. Recuperação de Sistema

```bash
# Testar conectividade
curl -X POST http://localhost:3000/api/health/systems/stripe/test

# Se estiver funcionando, reabilitar
curl -X PUT http://localhost:3000/api/systems/stripe/enable

# Verificar se o circuit breaker fechou
curl http://localhost:3000/api/health/systems/stripe
```

## 📱 Integração com Aplicações

### 1. JavaScript/Node.js

```javascript
const axios = require('axios');

class APIMiddlewareClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async makeRequest(endpoint, method, data, options = {}) {
    const params = new URLSearchParams();
    
    if (options.targetSystem) params.append('targetSystem', options.targetSystem);
    if (options.strategy) params.append('strategy', options.strategy);
    if (options.timeout) params.append('timeout', options.timeout);
    if (options.retry !== undefined) params.append('retry', options.retry);

    const url = `${this.baseURL}/api/proxy${endpoint}?${params.toString()}`;
    
    try {
      const response = await axios({
        method,
        url,
        data: method !== 'GET' ? data : undefined,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`API Middleware error: ${error.message}`);
    }
  }

  // Métodos de conveniência
  async get(endpoint, options) {
    return this.makeRequest(endpoint, 'GET', null, options);
  }

  async post(endpoint, data, options) {
    return this.makeRequest(endpoint, 'POST', data, options);
  }

  async put(endpoint, data, options) {
    return this.makeRequest(endpoint, 'PUT', data, options);
  }

  async delete(endpoint, options) {
    return this.makeRequest(endpoint, 'DELETE', null, options);
  }
}

// Uso
const client = new APIMiddlewareClient('http://localhost:3000');

// Exemplo de uso
async function processPayment() {
  try {
    const result = await client.post('/payment_intents', {
      amount: 5000,
      currency: 'usd'
    }, {
      strategy: 'failover',
      timeout: 10000
    });
    
    console.log('Pagamento processado:', result);
  } catch (error) {
    console.error('Erro no pagamento:', error);
  }
}
```

### 2. Python

```python
import requests
import json

class APIMiddlewareClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def make_request(self, endpoint, method, data=None, options=None):
        if options is None:
            options = {}
        
        params = {}
        if 'targetSystem' in options:
            params['targetSystem'] = options['targetSystem']
        if 'strategy' in options:
            params['strategy'] = options['strategy']
        if 'timeout' in options:
            params['timeout'] = options['timeout']
        if 'retry' in options:
            params['retry'] = options['retry']
        
        url = f"{self.base_url}/api/proxy{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, params=params)
            else:
                response = requests.request(
                    method, 
                    url, 
                    params=params, 
                    json=data,
                    headers={'Content-Type': 'application/json'}
                )
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API Middleware error: {str(e)}")
    
    def get(self, endpoint, options=None):
        return self.make_request(endpoint, 'GET', options=options)
    
    def post(self, endpoint, data, options=None):
        return self.make_request(endpoint, 'POST', data, options)
    
    def put(self, endpoint, data, options=None):
        return self.make_request(endpoint, 'PUT', data, options)
    
    def delete(self, endpoint, options=None):
        return self.make_request(endpoint, 'DELETE', options=options)

# Uso
client = APIMiddlewareClient('http://localhost:3000')

# Exemplo
try:
    result = client.post('/payment_intents', {
        'amount': 5000,
        'currency': 'usd'
    }, {
        'strategy': 'failover',
        'timeout': 10000
    })
    print('Pagamento processado:', result)
except Exception as e:
    print('Erro no pagamento:', e)
```

## 🔍 Troubleshooting

### 1. Problemas Comuns

#### Sistema não responde
```bash
# Verificar se está habilitado
curl http://localhost:3000/api/systems/stripe

# Verificar circuit breaker
curl http://localhost:3000/api/health/systems/stripe

# Testar conectividade
curl -X POST http://localhost:3000/api/health/systems/stripe/test
```

#### Requisições muito lentas
```bash
# Verificar timeouts configurados
curl http://localhost:3000/api/systems/stripe

# Ajustar timeout se necessário
curl -X PUT http://localhost:3000/api/systems/stripe \
  -H "Content-Type: application/json" \
  -d '{"timeout": 3000}'
```

#### Muitas falhas
```bash
# Verificar estatísticas
curl http://localhost:3000/api/systems/stats/overview

# Verificar logs da aplicação
tail -f logs/app.log
```

### 2. Comandos Úteis

```bash
# Monitorar saúde em tempo real
watch -n 5 'curl -s http://localhost:3000/api/health | jq'

# Verificar todos os sistemas
curl -s http://localhost:3000/api/systems | jq '.[] | {id, name, enabled, priority}'

# Testar todas as estratégias
for strategy in priority round-robin load-balance failover; do
  echo "Testing $strategy strategy..."
  curl -s "http://localhost:3000/api/proxy/test?strategy=$strategy" | jq '.metadata.strategy'
done
```

Estes exemplos demonstram como a API Middleware pode ser usada em cenários reais, fornecendo flexibilidade, confiabilidade e monitoramento para suas integrações com sistemas externos.
