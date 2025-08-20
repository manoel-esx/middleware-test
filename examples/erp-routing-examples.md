# Exemplos de Roteamento por ERP ID

Este documento demonstra como usar o sistema de roteamento por ERP ID da API Middleware para separar automaticamente requisições de diferentes ERPs para sistemas específicos.

## 🏢 Cenário: Sistema de Vendas com Múltiplos ERPs

Imagine que você tem um sistema que precisa se comunicar com diferentes ERPs:
- **ERP 123**: Sistema SAP
- **ERP 456**: Sistema Oracle
- **ERP 789**: Sistema Microsoft Dynamics

### 1. Configuração Inicial dos Sistemas

```bash
# Adicionar sistema SAP
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "sap-system",
    "name": "Sistema SAP",
    "baseUrl": "https://api.sap.com/v1",
    "apiKey": "sap_api_key_here",
    "timeout": 5000,
    "priority": 1
  }'

# Adicionar sistema Oracle
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "oracle-system",
    "name": "Sistema Oracle",
    "baseUrl": "https://api.oracle.com/v1",
    "apiKey": "oracle_api_key_here",
    "timeout": 6000,
    "priority": 2
  }'

# Adicionar sistema Microsoft Dynamics
curl -X POST http://localhost:3000/api/systems \
  -H "Content-Type: application/json" \
  -d '{
    "id": "dynamics-system",
    "name": "Sistema Microsoft Dynamics",
    "baseUrl": "https://api.dynamics.com/v1",
    "apiKey": "dynamics_api_key_here",
    "timeout": 7000,
    "priority": 3
  }'
```

### 2. Configuração dos Mapeamentos ERP

```bash
# Configurar ERP 123 para ir para SAP
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "123",
    "systemId": "sap-system"
  }'

# Configurar ERP 456 para ir para Oracle
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "456",
    "systemId": "oracle-system"
  }'

# Configurar ERP 789 para ir para Microsoft Dynamics
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "789",
    "systemId": "dynamics-system"
  }'
```

### 3. Verificar Configuração

```bash
# Listar todos os mapeamentos
curl http://localhost:3000/api/systems/erp-mappings

# Verificar mapeamento específico
curl http://localhost:3000/api/systems/erp-mappings/123
curl http://localhost:3000/api/systems/erp-mappings/456
curl http://localhost:3000/api/systems/erp-mappings/789
```

## 📊 Exemplos de Uso

### Exemplo 1: Consulta de Total de Vendas Brutas

#### ERP 123 (SAP)
```bash
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 123" \
  -d '{
    "empresaId": 1,
    "lojaId": 5
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "totalVendaBruta": 150000.00,
    "periodo": "2024-01"
  },
  "metadata": {
    "system": "sap-system",
    "status": 200,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "strategy": "priority",
    "erpId": "123",
    "routingMethod": "erp-mapping"
  }
}
```

#### ERP 456 (Oracle)
```bash
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 456" \
  -d '{
    "empresaId": 2,
    "lojaId": 10
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "totalVendaBruta": 275000.00,
    "periodo": "2024-01"
  },
  "metadata": {
    "system": "oracle-system",
    "status": 200,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "strategy": "priority",
    "erpId": "456",
    "routingMethod": "erp-mapping"
  }
}
```

#### ERP 789 (Microsoft Dynamics)
```bash
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 789" \
  -d '{
    "empresaId": 3,
    "lojaId": 15
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "totalVendaBruta": 89000.00,
    "periodo": "2024-01"
  },
  "metadata": {
    "system": "dynamics-system",
    "status": 200,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "strategy": "priority",
    "erpId": "789",
    "routingMethod": "erp-mapping"
  }
}
```

### Exemplo 2: Sem ERP ID (Usa Estratégia Padrão)

```bash
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -d '{
    "empresaId": 4,
    "lojaId": 20
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "totalVendaBruta": 120000.00,
    "periodo": "2024-01"
  },
  "metadata": {
    "system": "sap-system",
    "status": 200,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "strategy": "priority",
    "erpId": null,
    "routingMethod": "strategy"
  }
}
```

## 🔄 Cenários de Migração

### 1. Migração Gradual de ERP

```bash
# Fase 1: Configurar novo ERP para sistema existente
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "999",
    "systemId": "sap-system"
  }'

# Fase 2: Testar com algumas requisições
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 999" \
  -d '{"empresaId": 5, "lojaId": 25}'

# Fase 3: Migrar ERP 999 para novo sistema
curl -X DELETE http://localhost:3000/api/systems/erp-mappings/999

curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "999",
    "systemId": "oracle-system"
  }'
```

### 2. A/B Testing entre Sistemas

```bash
# Configurar ERP 888 para alternar entre sistemas
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "888",
    "systemId": "sap-system"
  }'

# Testar com SAP
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 888" \
  -d '{"empresaId": 6, "lojaId": 30}'

# Migrar para Oracle
curl -X DELETE http://localhost:3000/api/systems/erp-mappings/888

curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "888",
    "systemId": "oracle-system"
  }'

# Testar com Oracle
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 888" \
  -d '{"empresaId": 6, "lojaId": 30}'
```

## 📱 Integração com Aplicações

### 1. C#/.NET

```csharp
public class APIMiddlewareClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public APIMiddlewareClient(string baseUrl)
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
    }

    public async Task<TotalVendaBrutaResponse> GetTotalVendaBrutaAsync(
        TotalVendaBrutaDto request, 
        string erpId = null)
    {
        var url = $"{_baseUrl}/api/proxy/vendas/total-bruta";
        
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(request), 
                Encoding.UTF8, 
                "application/json")
        };

        // Adicionar header ERP ID se fornecido
        if (!string.IsNullOrEmpty(erpId))
        {
            httpRequest.Headers.Add("X-ERP-ID", erpId);
        }

        var response = await _httpClient.SendAsync(httpRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<TotalVendaBrutaResponse>(content);
    }
}

// Uso
var client = new APIMiddlewareClient("http://localhost:3000");

// Com ERP específico
var result1 = await client.GetTotalVendaBrutaAsync(
    new TotalVendaBrutaDto { EmpresaId = 1, LojaId = 5 }, 
    "123");

// Sem ERP (usa estratégia padrão)
var result2 = await client.GetTotalVendaBrutaAsync(
    new TotalVendaBrutaDto { EmpresaId = 2, LojaId = 10 });
```

### 2. JavaScript/Node.js

```javascript
class APIMiddlewareClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getTotalVendaBruta(request, erpId = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (erpId) {
      headers['X-ERP-ID'] = erpId;
    }

    const response = await fetch(`${this.baseURL}/api/proxy/vendas/total-bruta`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Uso
const client = new APIMiddlewareClient('http://localhost:3000');

// Com ERP específico
const result1 = await client.getTotalVendaBruta(
  { empresaId: 1, lojaId: 5 }, 
  '123'
);

// Sem ERP (usa estratégia padrão)
const result2 = await client.getTotalVendaBruta(
  { empresaId: 2, lojaId: 10 }
);
```

## 🔍 Monitoramento e Debug

### 1. Verificar Mapeamentos Ativos

```bash
# Listar todos os mapeamentos
curl http://localhost:3000/api/systems/erp-mappings | jq

# Verificar mapeamento específico
curl http://localhost:3000/api/systems/erp-mappings/123 | jq
```

### 2. Verificar Logs de Roteamento

```bash
# Ver logs da aplicação
tail -f logs/combined.log | grep "Roteando por ERP ID"

# Exemplo de log esperado:
# {"level":"info","message":"Roteando por ERP ID 123 para sistema sap-system","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 3. Testar Conectividade dos Sistemas

```bash
# Testar SAP
curl -X POST http://localhost:3000/api/health/systems/sap-system/test

# Testar Oracle
curl -X POST http://localhost:3000/api/health/systems/oracle-system/test

# Testar Microsoft Dynamics
curl -X POST http://localhost:3000/api/health/systems/dynamics-system/test
```

## 🚨 Troubleshooting

### 1. ERP não está sendo roteado

```bash
# Verificar se o mapeamento existe
curl http://localhost:3000/api/systems/erp-mappings/123

# Verificar se o sistema está habilitado
curl http://localhost:3000/api/systems/sap-system

# Verificar logs
tail -f logs/combined.log | grep "ERP ID"
```

### 2. Sistema não responde

```bash
# Verificar saúde do sistema
curl http://localhost:3000/api/health/systems/sap-system

# Testar conectividade
curl -X POST http://localhost:3000/api/health/systems/sap-system/test

# Verificar circuit breaker
curl http://localhost:3000/api/systems | jq '.[] | select(.id == "sap-system")'
```

### 3. Mapeamento incorreto

```bash
# Remover mapeamento incorreto
curl -X DELETE http://localhost:3000/api/systems/erp-mappings/123

# Configurar mapeamento correto
curl -X POST http://localhost:3000/api/systems/erp-mappings \
  -H "Content-Type: application/json" \
  -d '{
    "erpId": "123",
    "systemId": "oracle-system"
  }'
```

## 📋 Resumo de Endpoints

### Gerenciamento de ERP Mappings

- `GET /api/systems/erp-mappings` - Listar todos os mapeamentos
- `POST /api/systems/erp-mappings` - Configurar novo mapeamento
- `GET /api/systems/erp-mappings/:erpId` - Obter mapeamento específico
- `DELETE /api/systems/erp-mappings/:erpId` - Remover mapeamento

### Uso com ERP ID

- Incluir header `X-ERP-ID` em todas as requisições
- O middleware roteia automaticamente baseado no mapeamento
- Se não houver mapeamento, usa estratégia padrão
- Prioridade: Sistema específico > ERP ID > Estratégia

Este sistema permite uma separação limpa e automática de ERPs sem alterar a estrutura dos dados ou a lógica de negócio da sua aplicação.
