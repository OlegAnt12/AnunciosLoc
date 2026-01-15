# AnunciosLoc API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints by Category

### Auth Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "username": "user123",
  "password": "securePass123",
  "email": "user@example.com"  // optional
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "securePass123"
}

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

---

### Profile Endpoints

#### Get My Profile
```
GET /profiles/me
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com"
    },
    "profile": {
      "display_name": "John Doe",
      "bio": "Location-based messenger",
      "metadata": {}
    }
  }
}
```

#### Update Profile
```
PUT /profiles/me
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "profile": {
    "display_name": "Jane Doe",
    "bio": "Updated bio"
  }
}

Response (200):
{
  "success": true,
  "message": "Profile updated"
}
```

#### Get User Profile
```
GET /users/:userId
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "user": { ... },
    "profile": { ... }
  }
}
```

---

### Location Endpoints

#### Create Location
```
POST /locations
Authorization: Bearer <TOKEN>
Content-Type: application/json

// GPS Location
{
  "nome": "My Office",
  "descricao": "Main office building",
  "tipo_coordenada": "GPS",
  "latitude": 41.1579,
  "longitude": -8.6291,
  "raio_metros": 500
}

// Wi-Fi Location
{
  "nome": "Office WiFi",
  "descricao": "Office local network",
  "tipo_coordenada": "WIFI",
  "coordenadas": ["OfficeNet", "OfficeGuest"]
}

Response (201):
{
  "success": true,
  "data": {
    "id": 5,
    "nome": "My Office"
  }
}
```

#### Get Location
```
GET /locations/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "id": 5,
    "nome": "My Office",
    "tipo_coordenada": "GPS",
    "coordenadas": {
      "latitude": 41.1579,
      "longitude": -8.6291,
      "raio_metros": 500
    }
  }
}
```

#### Update Location
```
PUT /locations/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Updated Office",
  "tipo_coordenada": "WIFI",
  "coordenadas": ["NewSSID1", "NewSSID2"]
}

Response (200):
{
  "success": true,
  "message": "Location updated"
}
```

#### List User Locations
```
GET /users/:userId/locations
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    { "id": 5, "nome": "My Office", ... },
    { "id": 6, "nome": "Home WiFi", ... }
  ]
}
```

#### Delete Location
```
DELETE /locations/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Location deleted"
}
```

---

### Message Endpoints

#### Create Message
```
POST /messages
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "titulo": "Available desk space",
  "conteudo": "Free desks on 3rd floor",
  "local_id": 5,
  // OR inline location (if no local_id):
  // "latitude": 41.1579,
  // "longitude": -8.6291,
  // "raio_metros": 500,
  // "tipo_local": "GPS",
  // "nome_local": "Office Building"
  
  "modo_entrega": "DESCENTRALIZADO",
  "tipo_politica": "WHITELIST",
  "restricoes": [
    { "chave": "username", "valor": "user1" },
    { "chave": "username", "valor": "user2" }
  ],
  "data_inicio": "2025-01-15T08:00:00Z",
  "data_fim": "2025-01-20T18:00:00Z"
}

Response (201):
{
  "success": true,
  "message": "Message created",
  "data": { "id": 12 }
}
```

#### Get Received Messages
```
GET /messages?page=1&limit=20
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 10,
      "titulo": "Available desk",
      "conteudo": "...",
      "author": "admin",
      "local_nome": "My Office",
      "tipo_politica": "PUBLIC",
      "data_publicacao": "2025-01-15T10:00:00Z",
      "ja_recebida": false
    }
  ]
}
```

#### Get Sent Messages
```
GET /messages/sent?page=1&limit=20
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 12,
      "titulo": "Available desk",
      "local_nome": "My Office",
      "data_publicacao": "2025-01-15T08:00:00Z",
      "total_entregas": 5
    }
  ]
}
```

#### Get Nearby Messages (by GPS or WiFi)
```
POST /messages/nearby
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "latitude": 41.1579,
  "longitude": -8.6291,
  "wifi_ssids": ["OfficeNet", "OfficeGuest"]
}

Response (200):
{
  "success": true,
  "data": [
    { "id": 10, "titulo": "...", ... }
  ]
}
```

#### Receive Message
```
POST /messages/:id/receive
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "deviceId": "device123"
}

Response (200):
{
  "success": true,
  "message": "Message received",
  "data": { "entregaId": 45 }
}
```

#### Delete Message
```
DELETE /messages/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Message deleted"
}
```

---

### Notification Endpoints

#### Get Notifications
```
GET /notifications?limit=50
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "mensagem_id": 10,
      "acao": "NOTIFICACAO",
      "detalhes": "New message in your area",
      "data_log": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Get Unread Count
```
GET /notifications/count
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": { "count": 3 }
}
```

#### Mark All as Read
```
PUT /notifications/read
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Mark Single Notification as Read
```
PUT /notifications/:id/read
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Delete Notification
```
DELETE /notifications/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### Mule Endpoints

#### Get Mule Assignments
```
GET /mules/assignments
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "assignment_id": 1,
      "mensagem_id": 12,
      "titulo": "Available desk",
      "conteudo": "...",
      "local_nome": "My Office",
      "prioridade": 1,
      "publisher_username": "admin",
      "data_atribuicao": "2025-01-15T08:00:00Z",
      "entregue": false
    }
  ]
}
```

#### Accept Mule Assignment
```
POST /mules/assignments/:id/accept
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Assignment accepted",
  "data": {
    "assignmentId": 1,
    "mensagemId": 12
  }
}
```

#### Get Mule Config
```
GET /mules/config
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "user_id": 2,
    "capacity": 10,
    "ativo": true
  }
}
// Returns null if no config exists
```

#### Create/Update Mule Config
```
POST /mules/config
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "capacity": 15,
  "active": true
}

Response (200):
{
  "success": true,
  "message": "Configuration updated",
  "data": {
    "user_id": 2,
    "capacity": 15,
    "active": true
  }
}
```

#### Remove Mule Config
```
DELETE /mules/config
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "message": "Configuration removed"
}
```

---

## Error Responses

All errors follow this format:

```
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Message Policy Types

### WHITELIST
Only specified users can receive the message.
```json
"restricoes": [
  { "chave": "username", "valor": "allowed_user1" },
  { "chave": "username", "valor": "allowed_user2" }
]
```

### BLACKLIST
All users except specified ones can receive.
```json
"restricoes": [
  { "chave": "username", "valor": "blocked_user1" }
]
```

### PUBLIC
All users in location can receive (no restrictions).

---

## Message Delivery Modes

### CENTRALIZADO (Centralized)
Message delivery via central server. Backend finds all users in location and logs notifications.

### DESCENTRALIZADO (Decentralized)
Message delivery via mule relay nodes. Backend assigns mules based on capacity; mules accept and retransmit.

---

## Location Types

### GPS
- Latitude, Longitude, Radius (meters)
- Matching via Haversine distance formula
- Typical radius: 100-1000 meters

### WIFI
- List of SSIDs (network names)
- Matching when device connects to any SSID in list
- No internet required (local peer-to-peer)
- Typical range: 50-100 meters indoor

---

## Example Workflows

### Workflow 1: Send Nearby Message (Centralized)
1. User creates location "Office" (GPS: 41.1579, -8.6291, 500m)
2. User creates message:
   - `local_id`: 5
   - `modo_entrega`: "CENTRALIZADO"
   - `tipo_politica`: "PUBLIC"
3. Backend logs notification for all users in location
4. Other users fetch nearby messages → see this message
5. Users receive message → delivery recorded

### Workflow 2: Send Decentralized Message (Mule Relay)
1. User creates message with `modo_entrega: DESCENTRALIZADO`
2. Backend assigns to active mules (up to capacity)
3. Mule sees assignment in "Mulas" tab
4. Mule taps "Accept" → delivery record created + log entry
5. Mule relays message to other P2P devices (e.g., via Wi-Fi Direct)
6. Other devices receive → delivery recorded

### Workflow 3: Wi-Fi Location & Direct Reception
1. User creates location "Office WiFi" with SSID "OfficeNet"
2. Device A connects to "OfficeNet"
3. Device A calls `POST /messages/nearby` with `wifi_ssids: ["OfficeNet"]`
4. Backend matches to "Office WiFi" location
5. Backend returns messages published to "Office WiFi"
6. Device A receives messages directly

---

## Rate Limiting & Validation

- Message title & content must not be empty
- Policy rules must have both `chave` and `valor`
- Location radius must be positive
- SSID list must contain at least one SSID
- Mule capacity must be >= 0

---

## Notes

- Token expiration: Depends on backend config (typically 7-30 days)
- Notifications older than 7 days are auto-filtered
- Mule assignments are only shown if `entregue = FALSE`
- Inline location creation is automatic if coordinates provided but no `local_id`

