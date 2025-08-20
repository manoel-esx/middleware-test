# 🧪 ERPs Mock para Testes

Este diretório contém servidores mock que simulam diferentes sistemas ERP para testar o middleware de roteamento inteligente.

## 🚀 Sistemas Disponíveis

### 1. **SAP ERP Mock** (Porta 3001)
- **API Key**: `sap_mock_key_123`
- **Performance**: Rápido (100-500ms)
- **Características**: Sistema moderno, alta performance
- **Endpoints**: `/vendas/total-bruta`, `/produtos/:id`, `/clientes/:id`

### 2. **Oracle ERP Mock** (Porta 3002)
- **API Key**: `oracle_mock_key_456`
- **Performance**: Médio (150-600ms)
- **Características**: Sistema robusto, performance equilibrada
- **Endpoints**: `/vendas/total-bruta`, `/produtos/:id`, `/clientes/:id`

### 3. **Microsoft Dynamics ERP Mock** (Porta 3003)
- **API Key**: `dynamics_mock_key_789`
- **Performance**: Médio-lento (200-800ms)
- **Características**: Sistema moderno, interface amigável
- **Endpoints**: `/vendas/total-bruta`, `/produtos/:id`, `/clientes/:id`

### 4. **Legacy ERP Mock** (Porta 3004)
- **API Key**: `legacy_mock_key_999`
- **Performance**: Lento (500-2000ms)
- **Características**: Sistema legado, performance limitada
- **Endpoints**: `/vendas/total-bruta`, `/produtos/:id`, `/clientes/:id`

## 🔧 Instalação e Configuração

### 1. Instalar dependências
```bash
cd mocks
npm install
```

### 2. Iniciar todos os ERPs mock
```bash
# Opção 1: Usar o script principal
npm start

# Opção 2: Iniciar individualmente
npm run start:sap      # SAP na porta 3001
npm run start:oracle   # Oracle na porta 3002
npm run start:dynamics # Dynamics na porta 3003
npm run start:legacy   # Legacy na porta 3004

# Opção 3: Iniciar todos simultaneamente
npm run start:all
```

### 3. Configurar no middleware
```bash
# Em outro terminal, após iniciar o middleware
node scripts/setup-erp-mocks.js
```

## 🧪 Testes Automatizados

### 1. Teste completo do sistema
```bash
node scripts/test-erp-routing.js
```

### 2. Teste de conectividade
```bash
npm test
```

### 3. Verificar saúde individual
```bash
curl http://localhost:3001/health  # SAP
curl http://localhost:3002/health  # Oracle
curl http://localhost:3003/health  # Dynamics
curl http://localhost:3004/health  # Legacy
```

## 📊 Mapeamentos ERP Configurados

| ERP ID | Sistema | Descrição |
|---------|---------|-----------|
| 123 | SAP ERP | Sistema principal, alta prioridade |
| 456 | Oracle ERP | Sistema secundário, prioridade média |
| 789 | Microsoft Dynamics | Sistema terciário, prioridade baixa |
| 999 | Legacy ERP | Sistema legado, menor prioridade |

## 🔍 Exemplos de Uso

### 1. Testar roteamento por ERP ID
```bash
# ERP 123 vai para SAP
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 123" \
  -d '{"empresaId": 1, "lojaId": 5}'

# ERP 456 vai para Oracle
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 456" \
  -d '{"empresaId": 2, "lojaId": 10}'

# ERP 789 vai para Microsoft Dynamics
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 789" \
  -d '{"empresaId": 3, "lojaId": 15}'

# ERP 999 vai para Legacy
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -H "X-ERP-ID: 999" \
  -d '{"empresaId": 4, "lojaId": 20}'
```

### 2. Testar estratégias de roteamento
```bash
# Prioridade (padrão)
curl -X POST http://localhost:3000/api/proxy/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 5, "lojaId": 25}'

# Round-robin
curl -X POST "http://localhost:3000/api/proxy/vendas/total-bruta?strategy=round-robin" \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 6, "lojaId": 30}'

# Balanceamento de carga
curl -X POST "http://localhost:3000/api/proxy/vendas/total-bruta?strategy=load-balance" \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 7, "lojaId": 35}'

# Failover
curl -X POST "http://localhost:3000/api/proxy/vendas/total-bruta?strategy=failover" \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 8, "lojaId": 40}'
```

### 3. Testar endpoints específicos dos ERPs
```bash
# Produtos SAP
curl http://localhost:3001/produtos/123

# Clientes Oracle
curl http://localhost:3002/clientes/456

# Vendas Dynamics
curl -X POST http://localhost:3003/vendas/total-bruta \
  -H "Content-Type: application/json" \
  -d '{"empresaId": 1, "lojaId": 1}'

# Produtos Legacy
curl http://localhost:3004/produtos/999
```

## 🔧 Personalização

### 1. Modificar performance dos mocks
Edite o arquivo do servidor mock desejado e ajuste os valores de `simulateNetworkDelay`:

```javascript
// Para SAP (mais rápido)
const simulateNetworkDelay = (min = 50, max = 200) => { ... };

// Para Legacy (mais lento)
const simulateNetworkDelay = (min = 1000, max = 3000) => { ... };
```

### 2. Adicionar novos endpoints
Adicione novas rotas nos servidores mock:

```javascript
app.get('/novo-endpoint', async (req, res) => {
  await simulateNetworkDelay(100, 300);
  
  res.json({
    message: 'Novo endpoint mock',
    sistema: 'SAP',
    timestamp: new Date().toISOString()
  });
});
```

### 3. Modificar dados retornados
Ajuste os dados mock nos endpoints:

```javascript
const mockData = {
  totalVendaBruta: Math.floor(Math.random() * 1000000) + 100000, // Valores maiores
  // ... outros campos
};
```

## 🚨 Troubleshooting

### 1. Porta já em uso
```bash
# Verificar processos usando as portas
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3003
netstat -ano | findstr :3004

# Matar processo específico (Windows)
taskkill /PID <PID> /F

# Matar processo específico (Linux/Mac)
kill -9 <PID>
```

### 2. Middleware não reconhece os sistemas
```bash
# Verificar se os sistemas estão rodando
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health

# Reconfigurar sistemas no middleware
node scripts/setup-erp-mocks.js
```

### 3. Erro de autenticação
Verifique se está usando as API keys corretas:
- SAP: `sap_mock_key_123`
- Oracle: `oracle_mock_key_456`
- Dynamics: `dynamics_mock_key_789`
- Legacy: `legacy_mock_key_999`

## 📝 Logs e Monitoramento

### 1. Ver logs em tempo real
```bash
# Terminal 1: Iniciar ERPs
npm start

# Terminal 2: Ver logs do middleware
tail -f logs/combined.log | grep "ERP"

# Terminal 3: Ver logs específicos
tail -f logs/combined.log | grep "SAP"
tail -f logs/combined.log | grep "Oracle"
```

### 2. Métricas de performance
```bash
# Ver estatísticas dos sistemas
curl http://localhost:3000/api/systems/stats/overview

# Ver saúde de todos os sistemas
curl http://localhost:3000/api/health/systems
```

## 🎯 Cenários de Teste

### 1. **Migração Gradual**
- Configure ERP 999 para ir para SAP
- Teste com algumas requisições
- Migre para Oracle
- Compare performance

### 2. **A/B Testing**
- Configure ERP 888 para alternar entre sistemas
- Teste com SAP
- Migre para Oracle
- Compare resultados

### 3. **Teste de Circuit Breaker**
- Faça múltiplas requisições para o mesmo sistema
- Observe quando o circuit breaker abre
- Verifique recuperação automática

### 4. **Teste de Failover**
- Desabilite o sistema principal
- Verifique se as requisições vão para o secundário
- Reabilite o principal
- Verifique se volta ao normal

## 🔄 Atualizações e Manutenção

### 1. Atualizar dependências
```bash
cd mocks
npm update
```

### 2. Reiniciar todos os serviços
```bash
# Parar todos (Ctrl+C)
# Reiniciar middleware
npm start

# Reiniciar ERPs mock
npm start
```

### 3. Limpar logs
```bash
# Limpar logs do middleware
rm -rf logs/*.log

# Limpar logs dos ERPs mock (se houver)
rm -rf mocks/logs/*.log
```

---

## 📞 Suporte

Para dúvidas ou problemas com os ERPs mock:
1. Verifique os logs de erro
2. Confirme se todas as portas estão livres
3. Verifique se o middleware está rodando
4. Execute os testes automatizados
5. Consulte a documentação principal do projeto

**Happy Testing! 🧪✨**
