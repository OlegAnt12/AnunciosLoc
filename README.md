# AnunciosLoc - Location-Based Messaging & P2P System

## Project Overview

AnunciosLoc is a location-based, decentralized messaging platform enabling:
- **Centralized & Decentralized messaging** via mule relay nodes
- **Wi-Fi Direct & GPS-based location matching**
- **Policy-controlled message delivery** (whitelist, blacklist, public)
- **Offline support** through mule network infrastructure

---

## Quick Start (Dev)

### Using DevContainer (Recommended)
1. Open repository in VS Code and select **Reopen in Container**
2. DevContainer installs dependencies, waits for MySQL, and runs `npm run db:init`
3. Start Frontend:
   - In container: `make start-expo` or `cd Frontend && npm run start:lan`
   - Scan QR code with Expo Go app or use URL for physical devices

### Using Make (Requires Docker & Docker Compose)
```bash
make up              # Start app + MySQL
make shell-app       # Open shell in app container
make start-expo      # Start Metro/Expo
make test-backend    # Run backend tests
```

---

## Architecture

### Backend (Node.js + Express + MySQL)
- **Authentication**: JWT-based with token persistence
- **Message Management**: Create, send, receive, delete with policy filtering
- **Location Matching**: GPS radius + Wi-Fi SSID-based location detection
- **Mule Relay System**: Assignment, acceptance, retransmission logging
- **Notifications**: Real-time notification logging to `logs_mensagens`

### Frontend (Expo / React Native)
- **Auth Flow**: Login/register with token storage (AsyncStorage)
- **Profile Management**: Display and edit user profile (display_name, bio)
- **Locations Screen**: Create (GPS/WIFI), edit, and list user locations
- **Messages Screen**: 
  - Create with optional inline GPS/WIFI location
  - Delivery mode selector (Centralizado/Descentralizado)
  - Policy type selector (Whitelist/Blacklist/Public)
  - Policy rules editor (key-value pairs)
  - List sent, received, and nearby messages
  - Receive nearby messages
- **Mules Screen**: List assignments, accept & forward, configure capacity
- **Notifications Screen**: View, mark as read (all/per-item), delete

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and receive JWT token

### Profiles (`/api/profiles`)
- `GET /me` - Get authenticated user's profile
- `PUT /me` - Update profile (display_name, bio)
- `GET /users/:id` - Get user by ID (returns `{ user, profile }`)

### Locations (`/api/locations`)
- `POST /` - Create location (GPS or WIFI with SSIDs)
- `GET /:id` - Get location details
- `PUT /:id` - Update location (type, coordinates, SSIDs)
- `DELETE /:id` - Delete location
- `GET /users/:id/locations` - List user's locations

### Messages (`/api/messages`)
- `POST /` - Create message with optional inline location
  - Accepts: `titulo`, `conteudo`, `modo_entrega` (CENTRALIZADO/DESCENTRALIZADO), `tipo_politica` (WHITELIST/BLACKLIST/PUBLIC), `restricoes` (policy rules), `latitude`, `longitude`, `raio_metros`, `coordenadas` (SSID array), `nome_local`
- `GET /` - Get user's received messages (paginated)
- `GET /sent` - Get authenticated user's sent messages
- `GET /:id` - Get message by ID
- `POST /:id/receive` - Mark message as received (checks policy)
- `PUT /:id` - Update message (author only)
- `DELETE /:id` - Delete message (author only)
- `POST /nearby` - Get messages by location (GPS/WIFI)
  - Request: `{ latitude, longitude, wifi_ssids }`

### Notifications (`/api/notifications`)
- `GET /` - Get user's notifications (limit: 50)
- `GET /count` - Get unread notification count
- `PUT /read` - Mark all notifications as read
- `PUT /:id/read` - Mark notification as read (single)
- `POST /` - Create notification (admin/system)
- `DELETE /:id` - Delete notification (user owned)

### Mules (`/api/mules`)
- `GET /assignments` - List pending assignments for authenticated mule
- `POST /assignments/:id/accept` - Accept and deliver mule assignment
- `GET /config` - Get mule configuration
- `POST /config` - Create/update mule config (capacity, active status)
- `DELETE /config` - Remove mule configuration

---

## Core Flows

### 1. User Authentication & Session Restore
1. User registers/logs in → receives JWT token
2. Token stored in AsyncStorage
3. On app launch, AuthContext checks AsyncStorage and restores session
4. Token added to all API requests via interceptor

**Files**:
- `Frontend/src/contexts/AuthContext.js` - Auth state & persistence
- `Frontend/src/components/Auth/LoginScreen.js` - Login form
- `Frontend/src/components/Auth/RegisterScreen.js` - Register form
- `Backend/middleware/auth.js` - JWT verification

### 2. Location Management (GPS & Wi-Fi Direct)

#### GPS Mode
- Create location with latitude, longitude, and radius
- Stored in `coordenadas_gps` table
- Matching via distance calculation (Haversine formula)

#### Wi-Fi Direct Mode
- Create location with SSID list (network names)
- Stored in `ssids_wifi` table
- Device connects to any SSID in the list to match location
- No internet required — Wi-Fi Direct uses local peer-to-peer discovery

#### Physical Device Behavior
- When a device connects to a Wi-Fi network with a matching SSID, the location is **automatically matched** in the background via `verificar_localizacao_utilizador` stored procedure
- Multiple SSIDs support fallback — if device can't connect to SSID-A, it tries SSID-B, etc.
- No explicit authentication needed for location detection — only SSID matching
- App calls `POST /messages/nearby` with connected SSID list to fetch messages for that location

#### Wi-Fi Direct Explained
Wi-Fi Direct is a peer-to-peer standard allowing devices to connect directly without an access point:
1. **Setup**: User creates location "Office" with SSID "OfficeNet"
2. **Detection**: Device connects to "OfficeNet" → OS notifies app
3. **Message Discovery**: App sends SSID list to backend → receives nearby messages
4. **Mule Relay**: Mule device (connected to same network) accepts assignment → relays to other P2P devices
5. **Range**: Limited to Wi-Fi range (50-100m indoors)
6. **No Internet**: Works completely offline within local network

**Files**:
- `Backend/BD/AnunciosLoc.sql` - Tables: `locais`, `coordenadas_gps`, `ssids_wifi`
- `Frontend/src/components/Main/LocationsScreen.js` - Location UI (create, edit, delete, SSID input)
- `Backend/services/locationService.js` - Location CRUD & coordinate transitions

### 3. Message Creation & Delivery

**Centralized (Server-based)**:
1. User creates message with policy rules
2. Backend finds all users in location via `verificar_localizacao_utilizador`
3. Notifications logged to `logs_mensagens`
4. Users poll or load "nearby messages" and receive

**Decentralized (Mule-based)**:
1. User creates message with `modo_entrega: DESCENTRALIZADO`
2. Backend assigns to active mules (up to capacity)
3. Mules receive assignments in "Mulas" tab
4. Mule accepts → delivery recorded + retransmit logged
5. Mule relays to other devices in range (physical P2P)

**Policy Enforcement**:
- `WHITELIST`: Only users in `restricoes_mensagem` (chave=username, valor=allowed) receive
- `BLACKLIST`: All except blacklisted users
- `PUBLIC`: All users in location

**Files**:
- `Backend/services/messageService.js` - Message creation, policy filtering, mule assignment
- `Backend/controllers/messageController.js` - Message endpoints
- `Frontend/src/components/Main/MessagesScreen.js` - Create/list/receive UI
- `Frontend/src/services/api.js` - Message service calls

### 4. Mule Assignment & Acceptance
1. Mule registers config (activate, set capacity)
2. New decentralized messages assign mules (prioritized by available capacity)
3. Mule sees pending assignments in "Mulas" tab
4. Mule accepts assignment → delivery record created + log entry
5. Mule retransmits message to other devices (P2P via Wi-Fi Direct or local network)

**Files**:
- `Backend/services/muleService.js` - Config management, assignment listing, acceptance
- `Backend/controllers/muleController.js` - Mule endpoints
- `Frontend/src/components/Main/MulesScreen.js` - Mule UI
- `Backend/BD/AnunciosLoc.sql` - Tables: `config_mulas`, `mulas_mensagens`

### 5. Notification System
- Every message creation/receipt/relay logs to `logs_mensagens`
- Users can view notifications (filtered by action)
- Mark all as read or per-item mark/delete
- Badge count on Notifications tab shows unread count

**Files**:
- `Backend/services/notificationService.js` - Notification querying, marking read
- `Frontend/src/components/Main/NotificationsScreen.js` - Notification UI
- `Frontend/src/contexts/NotificationsContext.js` - Notification polling & badge state

---

## Database Schema Highlights

### Core Tables
- **utilizadores**: User accounts
- **perfis_utilizador**: User profiles (display_name, bio, extra metadata)
- **locais**: Locations (GPS or WIFI type)
- **coordenadas_gps**: GPS coordinates with radius
- **ssids_wifi**: Wi-Fi SSIDs per location
- **mensagens**: Published messages
- **entregas_mensagens**: Message delivery records (who received what)
- **restricoes_mensagem**: Policy rules per message
- **logs_mensagens**: Audit log (notifications, delivery, relay events)
- **mulas_mensagens**: Mule assignments (message → mule)
- **config_mulas**: Mule configuration (capacity, active status)

---

## Project Feature Phases

### ✅ Fase Inicial (Completed)
- [x] User authentication (login/register/session)
- [x] Profile management (create/edit)
- [x] Location management (GPS & Wi-Fi SSID)
- [x] Message creation with policy & delivery mode
- [x] Message receiving & nearby search
- [x] Notifications logging & UI
- [x] Mule configuration & assignment acceptance
- [x] Offline persistence (AsyncStorage for auth/config)

### 🔄 Fase Intermediária (Partial - In Progress)
- [x] Decentralized message routing via mules
- [x] Policy-based message filtering (whitelist/blacklist/public)
- [x] Notification polling & badge
- [ ] **TODO**: Offline message queue (when mule is offline, queue for later retry)
- [ ] **TODO**: Mule priority scheduling (high-priority messages first)
- [ ] **TODO**: Message encryption for sensitive policies
- [ ] **TODO**: Audit logs for compliance

### 🚀 Fase Final (Not Started)
- [ ] Multi-hop relay (message passes through 2+ mules)
- [ ] Mesh networking (dynamic mesh without central server)
- [ ] Advanced P2P (BLE, Bluetooth, native Wi-Fi Direct)
- [ ] Analytics dashboard (message delivery stats, network health)
- [ ] End-to-end encryption (RSA key exchange)
- [ ] Digital signatures for message authenticity
- [ ] Rate limiting & abuse prevention
- [ ] Admin panel for network monitoring

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



