# AnunciosLoc - Sistema de Mensagens Baseado em Localização & P2P

## Visão Geral do Projeto

AnunciosLoc é uma plataforma de mensagens descentralizada baseada em localização que permite:
- **Mensagens Centralizadas & Descentralizadas** via nós de retransmissão mule
- **Correspondência de localização baseada em Wi-Fi Direct & GPS**
- **Entrega de mensagens controlada por políticas** (lista branca, lista negra, pública)
- **Suporte offline** através da infraestrutura de rede mule

---

## Início Rápido (Dev)

### Usando DevContainer (Recomendado)
1. Abra o repositório no VS Code e selecione **Reabrir no Contêiner**
2. O DevContainer instala dependências, aguarda o MySQL e executa `npm run db:init`
3. Inicie o Frontend:
   - No contêiner: `make start-expo` ou `cd Frontend && npm run start:lan`
   - Digitalize o código QR com o app Expo Go ou use a URL para dispositivos físicos

### Usando Make (Requer Docker & Docker Compose)
```bash
make up              # Iniciar app + MySQL
make shell-app       # Abrir shell no contêiner do app
make start-expo      # Iniciar Metro/Expo
make test-backend    # Executar testes do backend
```

---

## Arquitetura

### Backend (Node.js + Express + MySQL)
- **Autenticação**: Baseada em JWT com persistência de token
- **Gerenciamento de Mensagens**: Criar, enviar, receber, excluir com filtragem de políticas
- **Correspondência de Localização**: Raio GPS + detecção de localização baseada em SSID Wi-Fi
- **Sistema de Retransmissão Mule**: Atribuição, aceitação, registro de retransmissão
- **Notificações**: Registro de notificações em tempo real para `logs_mensagens`

### Frontend (Expo / React Native)
- **Fluxo de Auth**: Login/registro com armazenamento de token (AsyncStorage)
- **Gerenciamento de Perfil**: Exibir e editar perfil do usuário (display_name, bio)
- **Tela de Localizações**: Criar (GPS/WIFI), editar e listar localizações do usuário
- **Tela de Mensagens**:
  - Criar com localização inline opcional GPS/WIFI
  - Seletor de modo de entrega (Centralizado/Descentralizado)
  - Seletor de tipo de política (Lista Branca/Lista Negra/Pública)
  - Editor de regras de política (pares chave-valor)
  - Listar enviadas, recebidas e mensagens próximas
  - Receber mensagens próximas
- **Tela de Mules**: Listar atribuições, aceitar & retransmitir, configurar capacidade
- **Tela de Notificações**: Visualizar, marcar como lida (tudo/item individual), excluir

---

## Endpoints da API

### Autenticação (`/api/auth`)
- `POST /register` - Registrar novo usuário
- `POST /login` - Login e receber token JWT

### Perfis (`/api/profiles`)
- `GET /me` - Obter perfil do usuário autenticado
- `PUT /me` - Atualizar perfil (display_name, bio)
- `GET /users/:id` - Obter usuário por ID (retorna `{ user, profile }`)

### Localizações (`/api/locations`)
- `POST /` - Criar localização (GPS ou WIFI com SSIDs)
- `GET /:id` - Obter detalhes da localização
- `PUT /:id` - Atualizar localização (tipo, coordenadas, SSIDs)
- `DELETE /:id` - Excluir localização
- `GET /users/:id/locations` - Listar localizações do usuário

### Mensagens (`/api/messages`)
- `POST /` - Criar mensagem com localização inline opcional
  - Aceita: `titulo`, `conteudo`, `modo_entrega` (CENTRALIZADO/DESCENTRALIZADO), `tipo_politica` (WHITELIST/BLACKLIST/PUBLIC), `restricoes` (regras de política), `latitude`, `longitude`, `raio_metros`, `coordenadas` (array SSID), `nome_local`
- `GET /` - Obter mensagens recebidas do usuário (paginadas)
- `GET /sent` - Obter mensagens enviadas do usuário autenticado
- `GET /:id` - Obter mensagem por ID
- `POST /:id/receive` - Marcar mensagem como recebida (verifica política)
- `PUT /:id` - Atualizar mensagem (apenas autor)
- `DELETE /:id` - Excluir mensagem (apenas autor)
- `POST /nearby` - Obter mensagens por localização (GPS/WIFI)
  - Solicitação: `{ latitude, longitude, wifi_ssids }`

### Notificações (`/api/notifications`)
- `GET /` - Obter notificações do usuário (limite: 50)
- `GET /count` - Obter contagem de notificações não lidas
- `PUT /read` - Marcar todas as notificações como lidas
- `PUT /:id/read` - Marcar notificação como lida (individual)
- `POST /` - Criar notificação (admin/sistema)
- `DELETE /:id` - Excluir notificação (usuário proprietário)

### Mules (`/api/mules`)
- `GET /assignments` - Listar atribuições pendentes para mule autenticado
- `POST /assignments/:id/accept` - Aceitar e entregar atribuição mule
- `GET /config` - Obter configuração mule
- `POST /config` - Criar/atualizar configuração mule (capacidade, status ativo)
- `DELETE /config` - Remover configuração mule


---

## Fluxos Principais

### 1. Autenticação de Usuário & Restauração de Sessão
1. Usuário registra/loga in → recebe token JWT
2. Token armazenado no AsyncStorage
3. No lançamento do app, AuthContext verifica AsyncStorage e restaura sessão
4. Token adicionado a todas as solicitações de API via interceptor

**Arquivos**:
- `Frontend/src/contexts/AuthContext.js` - Estado de auth & persistência
- `Frontend/src/components/Auth/LoginScreen.js` - Formulário de login
- `Frontend/src/components/Auth/RegisterScreen.js` - Formulário de registro
- `Backend/middleware/auth.js` - Verificação JWT

### 2. Gerenciamento de Localização (GPS & Wi-Fi Direct)

#### Modo GPS
- Criar localização com latitude, longitude e raio
- Armazenado na tabela `coordenadas_gps`
- Correspondência via cálculo de distância (fórmula Haversine)

#### Modo Wi-Fi Direct
- Criar localização com lista SSID (nomes de rede)
- Armazenado na tabela `ssids_wifi`
- Dispositivo conecta a qualquer SSID na lista para corresponder localização
- Sem internet necessária — Wi-Fi Direct usa descoberta peer-to-peer local

#### Comportamento de Dispositivo Físico
- Quando um dispositivo conecta a uma rede Wi-Fi com SSID correspondente, a localização é **correspondida automaticamente** em segundo plano via `verificar_localizacao_utilizador` stored procedure
- Múltiplos SSIDs suportam fallback — se dispositivo não puder conectar a SSID-A, tenta SSID-B, etc.
- Sem autenticação explícita necessária para detecção de localização — apenas correspondência SSID
- App chama `POST /messages/nearby` com lista SSID conectada para buscar mensagens para essa localização

#### Wi-Fi Direct Explicado
Wi-Fi Direct é um padrão peer-to-peer permitindo que dispositivos conectem diretamente sem ponto de acesso:
1. **Configuração**: Usuário cria localização "Escritório" com SSID "OfficeNet"
2. **Detecção**: Dispositivo conecta a "OfficeNet" → SO notifica app
3. **Descoberta de Mensagem**: App envia lista SSID para backend → recebe mensagens próximas
4. **Retransmissão Mule**: Dispositivo mule (conectado à mesma rede) aceita atribuição → retransmite para outros dispositivos P2P
5. **Alcance**: Limitado ao alcance Wi-Fi (50-100m internos)
6. **Sem Internet**: Funciona completamente offline dentro da rede local

**Arquivos**:
- `Backend/BD/AnunciosLoc.sql` - Tabelas: `locais`, `coordenadas_gps`, `ssids_wifi`
- `Frontend/src/components/Main/LocationsScreen.js` - UI de localização (criar, editar, excluir, entrada SSID)
- `Backend/services/locationService.js` - CRUD de localização & transições de coordenadas

### 3. Criação de Mensagem & Entrega

**Centralizado (Baseado em Servidor)**:
1. Usuário cria mensagem com regras de política
2. Backend encontra todos os usuários na localização via `verificar_localizacao_utilizador`
3. Notificações registradas em `logs_mensagens`
4. Usuários fazem polling ou carregam "mensagens próximas" e recebem

**Descentralizado (Baseado em Mule)**:
1. Usuário cria mensagem com `modo_entrega: DESCENTRALIZADO`
2. Backend atribui a mules ativas (até capacidade)
3. Mules recebem atribuições na aba "Mulas"
4. Mule aceita → entrega registrada + retransmissão registrada
5. Mule retransmite para outros dispositivos no alcance (P2P físico)

**Aplicação de Política**:
- `WHITELIST`: Apenas usuários em `restricoes_mensagem` (chave=username, valor=permitido) recebem
- `BLACKLIST`: Todos exceto usuários na lista negra
- `PUBLIC`: Todos os usuários na localização

**Arquivos**:
- `Backend/services/messageService.js` - Criação de mensagem, filtragem de política, atribuição mule
- `Backend/controllers/messageController.js` - Endpoints de mensagem
- `Frontend/src/components/Main/MessagesScreen.js` - UI de criar/listar/receber
- `Frontend/src/services/api.js` - Chamadas de serviço de mensagem

### 4. Atribuição Mule & Aceitação
1. Mule registra configuração (ativar, definir capacidade)
2. Novas mensagens descentralizadas atribuem mules (priorizadas por capacidade disponível)
3. Mule vê atribuições pendentes na aba "Mulas"
4. Mule aceita atribuição → registro de entrega criado + entrada de log
5. Mule retransmite para outros dispositivos (P2P via Wi-Fi Direct ou rede local)

**Arquivos**:
- `Backend/services/muleService.js` - Gerenciamento de configuração, listagem de atribuição, aceitação
- `Backend/controllers/muleController.js` - Endpoints mule
- `Frontend/src/components/Main/MulesScreen.js` - UI mule
- `Backend/BD/AnunciosLoc.sql` - Tabelas: `config_mulas`, `mulas_mensagens`

### 5. Sistema de Notificação
- Toda criação/recebimento/retransmissão de mensagem registra em `logs_mensagens`
- Usuários podem visualizar notificações (filtradas por ação)
- Marcar tudo como lida ou por item marcar/excluir
- Badge de contagem na aba Notificações mostra contagem não lida

**Arquivos**:
- `Backend/services/notificationService.js` - Consulta de notificação, marcar como lida
- `Frontend/src/components/Main/NotificationsScreen.js` - UI de notificação
- `Frontend/src/contexts/NotificationsContext.js` - Polling de notificação & estado de badge

---

## Destaques do Esquema de Banco de Dados

### Tabelas Principais
- **utilizadores**: Contas de usuário
- **perfis_utilizador**: Perfis de usuário (display_name, bio, metadados extras)
- **locais**: Localizações (tipo GPS ou WIFI)
- **coordenadas_gps**: Coordenadas GPS com raio
- **ssids_wifi**: SSIDs Wi-Fi por localização
- **mensagens**: Mensagens publicadas
- **entregas_mensagens**: Registros de entrega de mensagem (quem recebeu o quê)
- **restricoes_mensagem**: Regras de política por mensagem
- **logs_mensagens**: Log de auditoria (notificações, entrega, eventos de retransmissão)
- **mulas_mensagens**: Atribuições mule (mensagem → mule)
- **config_mulas**: Configuração mule (capacidade, status ativo)

---

## Fases de Recurso do Projeto

### ✅ Fase Inicial (Concluída)
- [x] Autenticação de usuário (login/registro/sessão)
- [x] Gerenciamento de perfil (criar/editar)
- [x] Gerenciamento de localização (GPS & SSID Wi-Fi)
- [x] Criação de mensagem com política & modo de entrega
- [x] Recebimento de mensagem & busca próxima
- [x] Registro de notificações & UI
- [x] Configuração mule & aceitação de atribuição
- [x] Persistência offline (AsyncStorage para auth/config)

### 🔄 Fase Intermediária (Parcial - Em Andamento)
- [x] Roteamento de mensagem descentralizada via mules
- [x] Filtragem baseada em política (lista branca/lista negra/pública)
- [x] Polling de notificação & badge
- [ ] **TODO**: Fila de mensagem offline (quando mule está offline, fila para nova tentativa)
- [ ] **TODO**: Agendamento de prioridade mule (mensagens de alta prioridade primeiro)
- [ ] **TODO**: Criptografia de mensagem para políticas sensíveis
- [ ] **TODO**: Logs de auditoria para conformidade

### 🚀 Fase Final (Não Iniciada)
- [ ] Retransmissão multi-hop (mensagem passa por 2+ mules)
- [ ] Rede mesh (mesh dinâmico sem servidor central)
- [ ] P2P avançado (BLE, Bluetooth, Wi-Fi Direct nativo)
- [ ] Painel de análise (estatísticas de entrega de mensagem, saúde da rede)
- [ ] Criptografia ponta-a-ponta (troca de chave RSA)
- [ ] Assinaturas digitais para autenticidade de mensagem
- [ ] Limitação de taxa & prevenção de abuso
- [ ] Painel de admin para monitoramento de rede

---

## Testing & QA

### Manual Testing Checklist
- [ ] Register & login flow
- [ ] Profile view & edit
- [ ] Create location (GPS + WIFI)
- [ ] Edit location
- [ ] Create message (inline location, policy rules)
- [ ] Receive nearby message
- [ ] Mark message read
- [ ] Delete message
- [ ] Register as mule
- [ ] Accept mule assignment
- [ ] View & manage notifications
- [ ] Test offline (AsyncStorage persistence)

### Known Limitations
- No automated tests in current MVP (user requested implementation focus)
- Wi-Fi Direct retransmission requires platform-specific modules
- Policy filtering relies on backend validation (no client-side encryption)
- Notification count polling every 60s (not real-time push)

---

## Backend Tests

```bash
cd backend
npm test
```

Tests cover: auth, profiles, messages, locations, notifications, mules

---

## Future Enhancements

1. **Push Notifications**: Integrate Firebase Cloud Messaging (FCM) for real-time alerts
2. **Message Encryption**: Implement RSA for policy-sensitive messages
3. **Offline Queue**: Store undelivered messages locally, retry on reconnect
4. **Mesh Networking**: Multi-hop relay without central server
5. **Analytics**: Dashboard for message delivery success rates
6. **Admin Panel**: Monitor network health, mule status, policy violations
7. **Blockchain Integration**: Immutable message audit trail (optional)
8. **Mobile-specific Wi-Fi Direct**: Use expo-native-modules or react-native-wifi-direct

---

## Running the Project

### Backend
```bash
cd backend
npm install
npm start  # Starts Express on port 3000
```

### Frontend
```bash
cd Frontend
npm install
npm start  # Starts Expo
```

### Database
- Import `BD/AnunciosLoc.sql` into MySQL
- Configure `backend/config/database.js` with your MySQL credentials

---

## Contributors
- Project lead: OlegAnt12
- Stack: Node.js, Express, React Native, Expo, MySQL



