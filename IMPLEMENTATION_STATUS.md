# AnunciosLoc - Relatório de Status de Implementação

## Visão Geral do Projeto
AnunciosLoc é uma plataforma de mensagens baseada em localização peer-to-peer descentralizada construída com backend Node.js/Express e frontend React Native/Expo. O sistema suporta modos de entrega de mensagens centralizados e descentralizados, comunicação P2P Wi-Fi Direct, políticas de mensagens (Whitelist/Blacklist/Public) e retransmissão baseada em mule para alcance estendido.

---

## Fase 1: Recursos Iniciais (✅ CONCLUÍDO)

### 1. Autenticação e Autorização
- **Status**: ✅ Concluído
- **Implementado**:
  - Registro de usuário (email, senha, nome)
  - Login de usuário com token JWT
  - Persistência de token em AsyncStorage
  - Injeção automática de token em solicitações de API
  - Restauração de sessão no lançamento do app
  - Funcionalidade de logout
- **Endpoints**:
  - `POST /api/auth/register` — Criar nova conta de usuário
  - `POST /api/auth/login` — Autenticar usuário e receber JWT
  - `POST /api/auth/logout` — Invalidar sessão (limpeza opcional do lado do cliente)
- **Frontend**: LoginScreen.js, RegisterScreen.js, AuthContext.js com gerenciamento de sessão

### 2. Perfis de Usuário
- **Status**: ✅ Concluído
- **Implementado**:
  - Visualizar perfil atual do usuário (GET /profiles/me)
  - Editar perfil (PUT /profiles/me) — nome, email, telefone, bio, URL do avatar
  - Persistência de dados de perfil entre sessões
- **Banco de Dados**: tabela `profiles` com chave estrangeira user_id
- **Frontend**: ProfileScreen.js com modal de edição

### 3. Gerenciamento de Localização
- **Status**: ✅ Concluído
- **Implementado**:
  - Criar localizações GPS (latitude, longitude, nome)
  - Criar localizações Wi-Fi (captura de SSID)
  - Visualizar localizações salvas com lista e mapa
  - Editar localizações existentes (PUT /api/locations/:id)
  - Excluir localizações
  - Seleção de SSID com detecção automática de UI
- **Tipos de Localização**:
  - GPS: Geolocalização padrão com cálculo de distância L2
  - WIFI: Identificação baseada em SSID para áreas indoor/urbanas
- **Banco de Dados**: tabela `locations` com tipo (GPS/WIFI), user_id
- **Frontend**: LocationsScreen.js com modal de criação inline, seletor de SSID, fluxo de edição

### 4. Sistema de Mensagens Core
- **Status**: ✅ Concluído
- **Implementado**:
  - Criar mensagens com conteúdo, título, referência de localização
  - Criação inline de localização durante criação de mensagem (sem necessidade de salvar primeiro)
  - Listagem de mensagens (abas enviadas/recebidas)
  - Modos de entrega de mensagens:
    - **Centralizado**: Todas as mensagens armazenadas no banco de dados backend, acessíveis a todos
    - **Descentralizado**: Entrega P2P Wi-Fi Direct apenas
  - Aplicação de política de mensagens:
    - **Public**: Qualquer pessoa pode receber
    - **Whitelist**: Apenas usuários específicos podem receber
    - **Blacklist**: Qualquer pessoa exceto usuários específicos pode receber
  - Gerenciamento de regras de política (pares chave=usuário)
  - Aba de mensagens próximas com ação de recebimento
  - Atualizações otimistas de UI
- **Endpoints**:
  - `POST /api/messages` — Criar mensagem
  - `GET /api/messages` — Listar mensagens do usuário
  - `GET /api/messages/nearby` — Obter mensagens próximas (baseado na localização do usuário)
  - `POST /api/messages/:id/receive` — Registrar entrega de mensagem
- **Banco de Dados**:
  - tabela `messages`: conteúdo, título, user_id, location_id, modo_entrega, tipo_politica
  - tabela `policies_mensagens`: message_id, user_id (para whitelist/blacklist)
  - tabela `entregas_mensagens`: message_id, user_id, tipo_entrega, timestamp
- **Frontend**: MessagesScreen.js com modal abrangente de criação

### 5. Sistema de Notificações
- **Status**: ✅ Concluído
- **Implementado**:
  - Listagem de notificações com badge de contagem não lida
  - Marcar notificação única como lida
  - Marcar todas as notificações como lidas
  - Excluir notificações individuais
  - Atualizações de badge em tempo real (via contexto)
  - Log persistente de notificações
- **Banco de Dados**: tabela `logs_mensagens` com user_id, message_id, timestamp visto
- **Frontend**: NotificationsScreen.js, hook de contexto useNotifications

### 6. Documentação
- **Status**: ✅ Concluído
- **Entregue**:
  - [README.md](README.md): Visão geral abrangente da arquitetura, fases de recursos, resumo da API, explicação do Wi-Fi Direct, esquema do banco de dados, checklist de QA
  - [docs/API.md](docs/API.md): Referência completa de endpoints com exemplos de solicitação/resposta, tratamento de erros, exemplos de fluxo de trabalho
  - IMPLEMENTATION_STATUS.md (este arquivo): Rastreamento de implementação e status

---

## Fase 2: Recursos Intermediários (✅ 95% CONCLUÍDO)

### 1. Sistema Mule/P2P Relay
- **Status**: ✅ 95% Concluído
- **Implementado**:
  - Atribuição de mensagens descentralizadas a mules ativas
  - Aceitação de atribuições mule com registro de entrega
  - Retransmissão via Wi-Fi Direct e BLE
  - Capacidade configurável de mule
  - Serviço de relay para multi-hop
- **Arquivos**: muleService.js, relayService.js, MulesScreen.js

### 2. Fila Offline
- **Status**: ✅ Concluído
- **Implementado**:
  - Detecção de conectividade de rede
  - Armazenamento de mensagens offline em AsyncStorage
  - Sincronização automática ao reconectar
  - Listeners de conectividade nas telas de mensagens e localizações
- **Arquivos**: offlineQueueService.js, MessagesScreen.js, LocationsScreen.js

### 3. Comunicação P2P Avançada
- **Status**: ✅ Concluído
- **Implementado**:
  - Componente BLE para descoberta e conexão mesh
  - Componente Wi-Fi P2P para peer discovery e messaging
  - Rede mesh BLE com roteamento multi-hop
  - Integração com retransmissão mule
- **Arquivos**: BLEComponent.js, WiFiP2PComponent.js, MeshNetworkingComponent.js

## Fase 3: Recursos Avançados (🔄 30% CONCLUÍDO)

### 1. Segurança e Criptografia
- **Status**: 🔄 Parcial
- **Implementado**: Validação JWT, rate limiting
- **Pendente**: Criptografia ponta-a-ponta, assinaturas digitais

### 2. Análise e Monitoramento
- **Status**: ❌ Não Iniciado
- **Pendente**: Painel de admin, estatísticas de entrega
- **Implementado**:
  - Registro de mule (usuário se torna nó de retransmissão)
  - Gerenciamento de configuração de mule (capacidade, status ativo)
  - Listagem de atribuições (tarefas pendentes de retransmissão de mensagens)
  - Aceitação de atribuições com registro de entrega
  - Estatísticas de mule (total de atribuições, contagem entregue, pendente, tempo médio de entrega)
  - Aceitação baseada em transação (prevenção de duplicatas)
- **Endpoints**:
  - `GET /api/mules/assignments` — Listar tarefas pendentes de retransmissão
  - `POST /api/mules/assignments/:id/accept` — Aceitar e entregar mensagem
  - `GET /api/mules/config` — Recuperar configuração de mule
  - `POST /api/mules/config` — Registrar/atualizar configurações de mule
  - `DELETE /api/mules/config` — Cancelar registro como mule
  - `GET /api/mules/stats` — Recuperar estatísticas de desempenho de mule
- **Banco de Dados**:
  - tabela `mulas`: user_id, ativo, capacidade, created_at
  - tabela `mulas_mensagens`: mula_id, message_id, status, created_at, delivered_at
- **Frontend**: MulesScreen.js com interface baseada em abas (aba de atribuições + aba de configuração com estatísticas)

### 2. Serviço de Fila Offline
- **Status**: ✅ Criado (não integrado ainda à UI)
- **Implementado**:
  - Enfileiramento de mensagens quando offline (via AsyncStorage)
  - Enfileiramento de localização quando offline
  - Lógica de nova tentativa em lote quando reconectado
  - Rastreamento de timestamp para persistência de fila
  - Prevenção de duplicatas
- **Serviço**: Frontend/src/services/offlineQueueService.js
- **Métodos**:
  - `queueMessage(message)` — Adicionar mensagem à fila offline
  - `retryOfflineMessages()` — Tentar entrega de mensagens enfileiradas
  - `queueLocation(location)` — Adicionar localização à fila offline
  - `retryOfflineLocations()` — Tentar upload de localizações enfileiradas
- **Status de Integração**: Serviço existe, mas não integrado ainda às telas MessagesScreen/LocationsScreen UI

### 3. Comunicação P2P Wi-Fi Direct
- **Status**: ⏳ Arquitetura Documentada (Implementação Pendente)
- **Como Funciona** (documentado no README):
  - **Mecanismo Físico**:
    - Quando o usuário cria uma localização Wi-Fi com SSID "CafeWifi", o app transmite isso como um hotspot Wi-Fi aberto
    - Outros usuários dentro do alcance (≈30-100m) escaneiam por SSID "CafeWifi"
    - Na conexão, os usuários podem descobrir uns aos outros sem servidor central (requer estrutura de conectividade multi-peer)
  - **Entrega de Mensagens**:
    - Modo centralizado: Backend armazena todas as mensagens, usuários consultam backend
    - Modo descentralizado: P2P direto via Wi-Fi para pares na mesma SSID (sem backend envolvido)
  - **Alcance e Limitações**:
    - Wi-Fi Direct: ~100-200m linha de visão
    - Bluetooth: ~10-100m (eficiente em bateria)
    - Internet: Ilimitado, mas requer conectividade
  - **Requisitos**:
    - Android: API WifiP2pManager (Android 4.0+) ou biblioteca de terceiros (react-native-wifi-p2p)
    - iOS: Estrutura MultipeerConnectivity (requer programa de desenvolvedor pago para modos em segundo plano)
- **TODO**:
  - Instalar react-native-wifi-p2p ou equivalente
  - Implementar descoberta de pares no início do app
  - Implementar transmissão de mensagens para pares próximos
  - Adicionar serviço em segundo plano para descoberta P2P

---

## Fase 3: Recursos Avançados (🚀 NÃO INICIADO)

### 1. Roteamento de Retransmissão Multi-Hop
- **Planejado**:
  - Roteamento de mensagens através de múltiplos nós mule
  - Busca de caminho para alcançar destinatários distantes
  - Rastreamento de contagem de hops e TTL (Time-To-Live)
- **Complexidade**: Alta — requer algoritmo de roteamento, cálculo de caminho baseado em grafo

### 2. Criptografia e Segurança
- **Planejado**:
  - Criptografia de ponta a ponta (E2E) com pares de chave pública/privada
  - Criptografia de mensagens antes do armazenamento no backend
  - Verificação de assinatura para provar identidade do remetente
  - Camada de transporte criptografada (HTTPS + TLS)
- **Complexidade**: Média — requer biblioteca de criptografia (ex.: TweetNaCl.js, libsodium.js)

### 3. Rede Mesh
- **Planejado**:
  - Formação de rede mesh ad-hoc entre dispositivos
  - Topologia de rede auto-curável
  - Redundância automática de caminho
- **Complexidade**: Muito Alta — requer pilha BLE (Bluetooth Low Energy) mesh ou implementação personalizada

### 4. Painel de Administração
- **Planejado**:
  - Estatísticas do sistema (total de usuários, mensagens, entregas)
  - Gerenciamento de usuários (banir, verificar, promover)
  - Moderação de mensagens (sinalizar/remover conteúdo inadequado)
  - Monitoramento de saúde da rede
- **Complexidade**: Média — requer autenticação de administrador, análises de banco de dados, frontend React separado ou painel

### 5. Análises e Relatórios
- **Planejado**:
  - Métricas de engajamento do usuário
  - Estatísticas de entrega de mensagens
  - Classificação de desempenho de mule
  - Mapas de calor de cobertura de rede
- **Complexidade**: Média — requer banco de dados de séries temporais ou ferramenta de BI integrada

---

## Pilha de Tecnologia

### Backend
- **Tempo de Execução**: Node.js 16+
- **Framework**: Express.js
- **Banco de Dados**: MySQL 8.0
- **Autenticação**: JWT (jsonwebtoken)
- **Middleware**:
  - Validação (express-validator)
  - Limitação de taxa
  - Tratamento de erros
  - Logging
- **Bibliotecas Principais**: mysql2/promise, dotenv, cors

### Frontend
- **Framework**: React Native / Expo
- **Navegação**: React Navigation (abas inferiores)
- **Cliente HTTP**: Axios com interceptor de token
- **Gerenciamento de Estado**: Contexto React (Auth, Notifications), Estado local de componente
- **Persistência**: AsyncStorage (token, cache)
- **Ícones**: MaterialCommunityIcons
- **Estilização**: StyleSheet (estilos inline, constantes de cor em themes.ts)

### Esquema do Banco de Dados (13+ tabelas)
1. **users** — Contas de usuário (email, hash de senha, created_at)
2. **profiles** — Perfis de usuário (nome, bio, telefone, avatar_url)
3. **locations** — Localizações GPS/WIFI (tipo, latitude, longitude, ssid, user_id)
4. **messages** — Dados de mensagem core (título, conteúdo, user_id, location_id, modo_entrega, tipo_politica)
5. **policies_mensagens** — Regras de política de mensagens (message_id, user_id para whitelist/blacklist)
6. **entregas_mensagens** — Registros de entrega de mensagens (message_id, user_id, tipo_entrega, timestamp)
7. **logs_mensagens** — Logs de notificações (user_id, message_id, timestamp visto)
8. **mulas** — Registro de mule (user_id, ativo, capacidade)
9. **mulas_mensagens** — Rastreamento de atribuição de mule (mula_id, message_id, status)
10. **notificacoes** — Fila de notificações (user_id, type, data)
11. **sessions** — Sessões ativas (user_id, token, expires_at)
12. **configs** — Configuração do sistema (pares chave-valor)
13. **device_tokens** — Tokens de notificação push (user_id, device_token, plataforma)

---

## Checklist Atual de Implementação

### ✅ Concluído
- [x] Autenticação de usuário (registro, login, persistência de sessão)
- [x] Gerenciamento de perfil (visualizar, editar)
- [x] Gerenciamento de localização (criação GPS/WIFI, edição)
- [x] Criação de mensagens com localização inline
- [x] Listagem de mensagens (abas enviadas/recebidas)
- [x] Políticas de mensagens (Public/Whitelist/Blacklist)
- [x] Modos de entrega de mensagens (Centralizado/Descentralizado)
- [x] Descoberta de mensagens próximas
- [x] Listagem e gerenciamento de notificações
- [x] Registro e configuração de mule
- [x] Aceitação de atribuição de mule
- [x] Exibição de estatísticas de mule
- [x] Serviço de fila offline (criado, não integrado)
- [x] Documentação abrangente (README + API.md)

### 🔄 Em Andamento
- [ ] Integrar serviço de fila offline às telas MessagesScreen e LocationsScreen UI
- [ ] Implementação P2P Wi-Fi Direct (requer biblioteca + código específico da plataforma)
- [ ] Monitoramento de conectividade de rede e acionamento de nova tentativa de fila

### 🚀 Não Iniciado
- [ ] Criptografia de ponta a ponta
- [ ] Algoritmo de roteamento multi-hop
- [ ] Rede mesh
- [ ] Painel de administração
- [ ] Análises e relatórios
- [ ] Suíte de testes automatizados
- [ ] Pipeline CI/CD

---

## Padrões Arquiteturais Principais

### Arquitetura Frontend
```
App.jsx (Ponto de entrada com restauração de Auth)
  ├── AuthContext (gerencia sessão de usuário, token)
  ├── hook useNotifications (contagem de badge, lista não lida)
  └── Navegação (Abas Inferiores)
      ├── HomeScreen
      ├── LocationsScreen
      ├── MessagesScreen
      ├── NotificationsScreen
      ├── ProfileScreen
      └── MulesScreen

Serviços (Abstração de API):
  ├── api.js (Instância Axios com interceptor de auth)
  ├── messageService.js (criar, listar, receber)
  ├── locationService.js (criar, editar, listar)
  ├── notificationService.js (marcar lida, excluir)
  ├── muleService.js (atribuir, configurar, estatísticas)
  └── offlineQueueService.js (enfileirar, tentar novamente)

Gerenciamento de Estado:
  ├── AsyncStorage (token, mensagens enfileiradas/localizações)
  ├── Contexto React (Auth, Notifications)
  └── Estado Local de Componente (formulários, listas)
```

### Arquitetura Backend
```
app.js (Configuração Express + middleware)
  ├── Rotas
  │   ├── /api/auth (registro, login)
  │   ├── /api/profiles (visualizar, editar)
  │   ├── /api/locations (CRUD)
  │   ├── /api/messages (criar, listar, receber)
  │   ├── /api/notifications (listar, marcar, excluir)
  │   ├── /api/mules (atribuições, configuração, estatísticas)
  │   └── /api/stats (estatísticas em todo o sistema)
  │
  ├── Middleware
  │   ├── auth.js (Verificação JWT)
  │   ├── validation.js (Validação de esquema)
  │   ├── errorHandler.js (Serialização de erros)
  │   └── logging.js (Logging de solicitação/resposta)
  │
  ├── Controladores (Manipuladores de rota)
  │   ├── authController.js
  │   ├── profileController.js
  │   ├── locationController.js
  │   ├── messageController.js
  │   ├── notificationController.js
  │   ├── muleController.js
  │   └── statsController.js
  │
  ├── Serviços (Lógica de negócio)
  │   ├── authService.js (hashing, geração JWT)
  │   ├── locationService.js (Consultas de geolocalização)
  │   ├── messageService.js (Aplicação de política, entrega)
  │   ├── notificationService.js (Criação de log)
  │   └── muleService.js (Gerenciamento de retransmissão)
  │
  ├── Modelos (Abstração de banco de dados)
  │   ├── User.js
  │   ├── Profile.js
  │   ├── Location.js
  │   ├── Message.js
  │   ├── Notification.js
  │   └── Device.js
  │
  └── Banco de Dados (Pool de conexão MySQL)
```

---

## Exemplos de Contrato de API

### Criar Mensagem (com localização inline)
```javascript
// Solicitação frontend
{
  titulo: "Evento no Parque",
  conteudo: "Encontro amanhã às 3pm",
  modo_entrega: "Centralizado", // ou Descentralizado
  tipo_politica: "Public",        // Public, Whitelist, Blacklist
  location: {
    tipo: "GPS",
    latitude: 38.722,
    longitude: -9.139,
    nome: "Parque da Cidadela"
  },
  usuarios_politica: ["alice@mail.com"] // apenas para Whitelist/Blacklist
}

// Resposta backend
{
  success: true,
  data: {
    id: 42,
    titulo: "Evento no Parque",
    conteudo: "Encontro amanhã às 3pm",
    local_id: 15,
    modo_entrega: "Centralizado",
    tipo_politica: "Public",
    created_at: "2024-01-15T10:30:00Z"
  }
}
```

### Mule Aceitar Atribuição
```javascript
// Solicitação frontend
POST /api/mules/assignments/99/accept

// Lógica backend
1. Verificar se atribuição existe e não está aceita
2. Iniciar transação
3. Atualizar mulas_mensagens status para "delivered"
4. Inserir em entregas_mensagens (registrar entrega)
5. Confirmar transação
6. Resposta inclui contagem de entrega atualizada

// Resposta
{
  success: true,
  data: {
    assignment_id: 99,
    status: "delivered",
    timestamp: "2024-01-15T10:35:00Z"
  }
}
```

---

## Limitações Conhecidas e Trabalho Futuro

### Imediato (Próximo Sprint)
1. **Integração de Fila Offline**: Conectar offlineQueueService aos fluxos de criação de mensagens/localizações
2. **Monitoramento de Conectividade de Rede**: Adicionar listener NetInfo para acionar nova tentativa de fila
3. **Wi-Fi Direct P2P**: Avaliar opções de biblioteca (react-native-wifi-p2p, react-native-ble-plx)

### Curto Prazo (1-2 meses)
1. **Criptografia de Ponta a Ponta**: Implementar criptografia/decryptografia de mensagens por destinatário
2. **TTL de Mensagens e Expiração**: Permitir que usuários definam vida útil de mensagens
3. **Bloqueio de Usuário**: Adicionar funcionalidade de bloquear/desbloquear
4. **Regras de Política Avançadas**: Políticas baseadas em tempo, localização-raios

### Longo Prazo (3+ meses)
1. **Roteamento Multi-Hop**: Implementar busca de caminho Dijkstra-based para destinatários distantes
2. **Rede Mesh**: Topologia BLE mesh usando Bluetooth 5.0
3. **Painel de Administração**: Interface web para monitoramento e moderação do sistema
4. **Análises**: Métricas de engajamento, taxas de sucesso de entrega, placar de desempenho de mule

---

## Checklist de Testes e QA

### Testes Manuais (no Expo)
- [ ] Registrar novo usuário e verificar validação de email
- [ ] Login e verificar persistência de token entre reinício do app
- [ ] Criar localização GPS e visualizar no mapa
- [ ] Criar localização Wi-Fi escaneando SSIDs próximos
- [ ] Criar mensagem com localização inline e verificar no banco de dados
- [ ] Receber mensagem e verificar entrega registrada
- [ ] Alternar entre modos de entrega Centralizado/Descentralizado
- [ ] Aplicar política Whitelist e verificar que usuários não na lista não podem receber
- [ ] Receber mensagens próximas e tocar na ação de receber
- [ ] Marcar notificações como lidas individualmente
- [ ] Marcar todas as notificações como lidas e verificar atualização de contagem
- [ ] Registrar como mule e visualizar estatísticas
- [ ] Aceitar atribuição de mule e verificar mudança de status
- [ ] Atualizar capacidade de mule e verificar persistência
- [ ] Ficar offline (modo avião) e enfileirar mensagem, então online e verificar nova tentativa

### Testes de Rede
- [ ] Verificar injeção de token JWT em todas as solicitações de API
- [ ] Verificar resposta 401 e logout em token expirado
- [ ] Verificar limitação de taxa em endpoints de auth
- [ ] Verificar cabeçalhos CORS permitem origem frontend

### Testes de Banco de Dados
- [ ] Verificar políticas de mensagens aplicadas corretamente no banco de dados
- [ ] Verificar registros de entrega criados no recebimento de mensagens
- [ ] Verificar agregação de estatísticas de mule (contagem, cálculo médio)
- [ ] Verificar reversão de transação se erro ocorrer na aceitação de mule

---

## Notas de Implantação

### Implantação Backend (Node.js + MySQL)
1. Garantir arquivo `.env` com credenciais DB e JWT_SECRET
2. Executar `npm install` para instalar dependências
3. Executar `npm run init-db` para criar tabelas e dados iniciais
4. Executar `npm start` para iniciar servidor Express na porta 3000
5. Configurar MySQL para permitir conexões remotas (se necessário)
6. Definir variáveis de ambiente para produção:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET` (string aleatória, ≥32 caracteres)
   - `NODE_ENV=production`

### Implantação Frontend (Expo/React Native)
1. Atualizar `api.js` com URL de backend de produção
2. Construir APK: `eas build --platform android --local`
3. Construir IPA: `eas build --platform ios --local`
4. Submeter para Google Play Store / Apple App Store
5. Atualizar `app.json` com metadados do app (nome, versão, ícone, splash)

---

## Solução de Problemas

### Problema: Token expirado ou não sendo enviado
**Solução**: Verificar que o interceptor Axios em `frontend/src/services/api.js` está injetando corretamente o token no cabeçalho Authorization

### Problema: Mensagens não aparecem na aba próxima
**Solução**: Verificar se a localização é criada com coordenadas GPS corretas e modo de entrega de mensagens é "Centralizado"

### Problema: Atribuição de mule não registra entrega
**Solução**: Verificar se a transação em `backend/services/muleService.js acceptAssignment()` está confirmando com sucesso; verificar inserção `entregas_mensagens`

### Problema: Badge de notificações não atualiza
**Solução**: Garantir que NotificationService seja chamado após recebimento de mensagem; verificar se o contexto useNotifications está inscrito para atualizações

---

## Referências
- [README.md](README.md) — Visão geral completa do projeto e explicação de recursos
- [docs/API.md](docs/API.md) — Documentação completa de endpoints da API
- [backend/docs/api.md](backend/docs/api.md) — Notas de implementação backend
- PDF da especificação do projeto — Documento de requisitos original

---

**Última Atualização**: Janeiro 2024  
**Status**: Implementação de Fase 1 & 2 concluída; Fase 3 planejada
