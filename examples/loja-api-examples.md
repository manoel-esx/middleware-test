# Exemplos de Uso da API de Loja

## Endpoint: `/api/loja/verificar-bloqueio-vg`

Este endpoint simula a API de verificação de bloqueio VG que sua aplicação C# espera.

### 1. Requisição POST para Verificar Bloqueio VG

```bash
curl -X POST http://localhost:3000/api/loja/verificar-bloqueio-vg \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Resposta esperada:**
```json
{
  "hasError": false,
  "data": [
    "Loja 001 - Bloqueio ativo",
    "Loja 003 - Bloqueio ativo",
    "Loja 007 - Bloqueio ativo"
  ],
  "notifications": "Verificação de bloqueio VG concluída com sucesso"
}
```

### 2. Verificação do Status (GET)

```bash
curl http://localhost:3000/api/loja/verificar-bloqueio-vg
```

**Resposta esperada:**
```json
{
  "message": "Endpoint de verificação de bloqueio VG ativo",
  "description": "Use POST para verificar bloqueios VG",
  "endpoint": "/loja/verificar-bloqueio-vg",
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### 3. Rota Raiz da Loja

```bash
curl http://localhost:3000/api/loja
```

**Resposta esperada:**
```json
{
  "message": "API de Loja - Sistema de Roteamento Inteligente",
  "endpoints": {
    "verificarBloqueioVG": "/loja/verificar-bloqueio-vg - Verificar bloqueios VG",
    "docs": "Documentação da API de Loja"
  },
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### 4. Exemplo com JavaScript/Fetch

```javascript
// Verificar bloqueio VG
async function verificarBloqueioVG() {
  try {
    const response = await fetch('/api/loja/verificar-bloqueio-vg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    console.log('Bloqueios VG:', result);
    return result;
  } catch (error) {
    console.error('Erro ao verificar bloqueio VG:', error);
  }
}

// Exemplo de uso
verificarBloqueioVG().then(result => {
  if (!result.hasError) {
    console.log('Lojas com bloqueio:', result.data);
    console.log('Notificação:', result.notifications);
  }
});
```

### 5. Exemplo com Axios

```javascript
const axios = require('axios');

async function verificarBloqueioVGComAxios() {
  try {
    const response = await axios.post('/api/loja/verificar-bloqueio-vg', {}, {
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'NovoCore.ERPGateway'
      }
    });
    
    console.log('Bloqueios VG verificados:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar bloqueio VG:', error.response?.data || error.message);
  }
}

// Uso
verificarBloqueioVGComAxios();
```

### 6. Exemplo com C# (HttpClient)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class LojaService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public LojaService(HttpClient httpClient, string baseUrl)
    {
        _httpClient = httpClient;
        _baseUrl = baseUrl;
    }

    public async Task<BloqueioVGResponseDto> VerificarBloqueioVGAsync()
    {
        try
        {
            var url = $"{_baseUrl}/api/loja/verificar-bloqueio-vg";
            var content = new StringContent("{}", Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();
            
            var jsonResponse = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<BloqueioVGResponseDto>(jsonResponse);
        }
        catch (Exception ex)
        {
            // Log do erro
            return new BloqueioVGResponseDto
            {
                HasError = true,
                Data = new List<string>(),
                Notifications = $"Erro na requisição: {ex.Message}"
            };
        }
    }
}

// Uso
var lojaService = new LojaService(httpClient, "http://localhost:3000");
var resultado = await lojaService.VerificarBloqueioVGAsync();

if (!resultado.HasError)
{
    Console.WriteLine($"Lojas com bloqueio: {string.Join(", ", resultado.Data)}");
    Console.WriteLine($"Notificação: {resultado.Notifications}");
}
```

## Estrutura da Resposta

A resposta segue exatamente o formato do seu DTO `BloqueioVGResponseDto`:

```json
{
  "hasError": false,           // bool - Indica se houve erro
  "data": [                    // List<string> - Lista de lojas com bloqueio
    "Loja 001 - Bloqueio ativo",
    "Loja 003 - Bloqueio ativo"
  ],
  "notifications": "string"    // string - Mensagem de notificação
}
```

## Logs Gerados

O endpoint gera logs detalhados para:
- Requisições recebidas
- Respostas enviadas
- Erros ocorridos

Todos os logs são salvos nos arquivos:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

## Integração com sua Aplicação C#

Para integrar com sua aplicação C#, você só precisa:

1. **Configurar a URL base** para apontar para o middleware
2. **Manter o mesmo DTO** que já está usando
3. **Usar o mesmo endpoint** `/verificar-bloqueio-vg`

O middleware responderá exatamente no formato que sua aplicação espera, incluindo:
- ✅ `hasError` como boolean
- ✅ `data` como array de strings
- ✅ `notifications` como string
- ✅ Status HTTP 200 para sucesso
- ✅ Status HTTP 500 para erros
