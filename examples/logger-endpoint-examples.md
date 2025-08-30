# Exemplos de Uso do Endpoint de Logging

## Endpoint: `/api/logger/*`

Este endpoint genérico permite que você envie qualquer tipo de requisição POST para qualquer caminho após `/api/logger/` e ela será logada no sistema. O `*` significa que aceita qualquer rota como `/api/logger/users`, `/api/logger/orders`, `/api/logger/debug`, etc.

### 1. Requisição POST Básica

```bash
# Rota raiz
curl -X POST http://localhost:3000/api/logger \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Teste de logging",
    "data": {
      "userId": 123,
      "action": "login"
    }
  }'

# Rota com caminho específico
curl -X POST http://localhost:3000/api/logger/users \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log de usuários",
    "data": {
      "userId": 123,
      "action": "login"
    }
  }'

# Rota com caminho aninhado
curl -X POST http://localhost:3000/api/logger/orders/123/status \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log de status do pedido",
    "data": {
      "orderId": 123,
      "status": "shipped"
    }
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Requisição recebida e logada com sucesso",
  "requestId": "req_1703123456789_abc123def",
  "timestamp": "2023-12-21T10:30:56.789Z",
  "receivedData": {
    "method": "POST",
    "url": "/api/logger/users",
    "bodySize": 89,
    "headersCount": 8
  }
}
```

### 2. Requisição com Headers Personalizados

```bash
curl -X POST http://localhost:3000/api/logger \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: custom-123" \
  -H "X-User-Agent: MyApp/1.0" \
  -d '{
    "event": "user_action",
    "details": "Usuário clicou no botão"
  }'
```

### 3. Verificação do Status (GET)

```bash
# Verificar rota raiz
curl http://localhost:3000/api/logger

# Verificar rota específica
curl http://localhost:3000/api/logger/users

# Verificar rota aninhada
curl http://localhost:3000/api/logger/orders/123/status
```

**Resposta esperada:**
```json
{
  "message": "Endpoint de logging ativo",
  "description": "Use POST para enviar dados para logging. Aceita qualquer caminho após /api/logger/",
  "currentPath": "/users",
  "fullUrl": "/api/logger/users",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### 4. Exemplo com JavaScript/Fetch

```javascript
// Enviar dados para logging
async function logRequest(data) {
  try {
    const response = await fetch('/api/logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('Log enviado:', result);
    return result;
  } catch (error) {
    console.error('Erro ao enviar log:', error);
  }
}

// Exemplo de uso
logRequest({
  event: 'button_click',
  buttonId: 'submit-form',
  timestamp: new Date().toISOString(),
  userData: {
    userId: 456,
    sessionId: 'sess_789'
  }
});
```

### 5. Exemplo com Axios

```javascript
const axios = require('axios');

async function logWithAxios(data) {
  try {
    const response = await axios.post('/api/logger', data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'MyApplication'
      }
    });
    
    console.log('Log enviado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar log:', error.response?.data || error.message);
  }
}

// Uso
logWithAxios({
  action: 'file_upload',
  fileName: 'document.pdf',
  fileSize: 1024000,
  metadata: {
    uploadTime: new Date().toISOString(),
    userId: 789
  }
});
```

## Caminhos Dinâmicos

O endpoint aceita qualquer caminho após `/api/logger/`, permitindo organizar logs por contexto:

- `/api/logger/users` - Logs relacionados a usuários
- `/api/logger/orders` - Logs relacionados a pedidos
- `/api/logger/debug` - Logs de debug
- `/api/logger/errors` - Logs de erros
- `/api/logger/analytics` - Logs de analytics
- `/api/logger/orders/123/status` - Logs específicos de um pedido

Isso permite organizar melhor os logs e facilitar a busca e filtragem posterior.

## O que é Logado

O endpoint captura e loga as seguintes informações:

- **Método HTTP**: POST, GET, etc.
- **URL**: Endpoint completo da requisição
- **Headers**: Todos os headers da requisição
- **Body**: Conteúdo do corpo da requisição
- **Query Parameters**: Parâmetros da URL
- **Route Parameters**: Parâmetros da rota
- **Timestamp**: Momento exato da requisição
- **IP**: Endereço IP do cliente
- **User-Agent**: Navegador/aplicação do cliente
- **Request ID**: Identificador único para rastreamento

## Logs Gerados

Os logs são salvos nos arquivos:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

E também aparecem no console durante desenvolvimento.

## Casos de Uso

- **Debugging**: Log de requisições para análise
- **Auditoria**: Rastreamento de ações dos usuários
- **Monitoramento**: Acompanhamento de uso da API
- **Desenvolvimento**: Testes e validação de dados
- **Integração**: Log de dados de sistemas externos
