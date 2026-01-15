# AnunciosLoc - Documentation Index

Welcome to AnunciosLoc! This document helps you navigate all project documentation.

---

## 📋 Quick Navigation

### 🚀 Getting Started
1. **First Time?** → Read [README.md](README.md) (complete architecture & feature overview)
2. **Need API Details?** → Check [docs/API.md](docs/API.md) (all endpoints with examples)
3. **Want to Test?** → Use [QA_CHECKLIST.md](QA_CHECKLIST.md) (100+ test scenarios)

### 📊 Project Status
- **Implementation Status** → [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- **Feature Roadmap** → [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)
- **Session Summary** → [SESSION_COMPLETION.md](SESSION_COMPLETION.md)

---

## 📁 File Guide

### Core Documentation

| File | Purpose | Best For |
|------|---------|----------|
| [README.md](README.md) | Architecture, features, Wi-Fi Direct explanation, database schema | Developers & Project Managers |
| [docs/API.md](docs/API.md) | Complete API endpoint reference with examples & error responses | Backend & Frontend Developers |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | Current implementation status, patterns, architecture, limitations | Technical Review |
| [QA_CHECKLIST.md](QA_CHECKLIST.md) | 14 phases of manual testing with 100+ test scenarios | QA Testers |
| [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) | Phase tracking, backlog, success criteria, roadmap | Project Managers |
| [SESSION_COMPLETION.md](SESSION_COMPLETION.md) | What was delivered in this session | Session Review |

### Code Structure

```
/workspaces/AnunciosLoc/
├── README.md                           ← START HERE
├── IMPLEMENTATION_STATUS.md            ← Feature tracking
├── FEATURE_ROADMAP.md                  ← Roadmap & backlog
├── QA_CHECKLIST.md                     ← Testing guide
├── SESSION_COMPLETION.md               ← Session deliverables
│
├── backend/                            ← Node.js + Express backend
│   ├── app.js                          ← Express setup
│   ├── server.js                       ← Server startup
│   ├── package.json                    ← Dependencies
│   ├── config/                         ← Database & environment config
│   ├── controllers/                    ← Route handlers
│   ├── services/                       ← Business logic
│   ├── models/                         ← Database models
│   ├── middleware/                     ← Auth, validation, logging
│   ├── routes/                         ← API route definitions
│   ├── tests/                          ← Test files (optional)
│   ├── utils/                          ← Helper functions
│   └── docs/
│       └── api.md                      ← API documentation
│
├── Frontend/                           ← React Native + Expo frontend
│   ├── app.json                        ← Expo config
│   ├── App.jsx                         ← Root component
│   ├── package.json                    ← Dependencies
│   ├── app/                            ← Expo Router screens
│   ├── src/
│   │   ├── components/                 ← UI components
│   │   │   ├── Auth/                   ← LoginScreen, RegisterScreen
│   │   │   └── Main/                   ← HomeScreen, MessagesScreen, etc.
│   │   ├── contexts/                   ← AuthContext, NotificationsContext
│   │   ├── hooks/                      ← Custom hooks (useApi, useOfflineSync)
│   │   ├── services/                   ← API wrappers, offline queue
│   │   ├── styles/                     ← Themes and common styles
│   │   └── config/                     ← API configuration
│   └── assets/                         ← Images and media
│
├── BD/                                 ← Database
│   └── AnunciosLoc.sql                 ← SQL schema
│
└── Modelo de relatório.pdf             ← Original project specification
```

---

## 🎯 Feature Overview

### ✅ Phase 1: MVP (100% Complete)
- [x] **Authentication**: Register, login, session management
- [x] **Profiles**: View and edit user profiles
- [x] **Locations**: GPS and Wi-Fi location management
- [x] **Messages**: Create, send, receive with policies
- [x] **Notifications**: List, mark read, delete
- [x] **Documentation**: README, API docs, database schema

**Status**: PRODUCTION READY

### 🔄 Phase 2: Intermediate (70% Complete)
- [x] **Mule System**: Relay nodes, assignments, acceptance, stats
- [x] **Offline Queue**: Message/location queueing with auto-retry
- [x] **Network Monitoring**: NetInfo integration for offline detection
- [ ] **Wi-Fi Direct P2P**: Architecture documented, library pending
- [ ] **User Blocking**: Not yet implemented
- [ ] **Message Encryption**: Not yet implemented

**Status**: BETA READY (pending QA testing and P2P implementation)

### 🚀 Phase 3: Advanced (0% - Planning)
- [ ] Multi-hop relay routing
- [ ] Mesh networking
- [ ] End-to-end encryption
- [ ] Admin dashboard
- [ ] Analytics platform

**Status**: PLANNING PHASE

---

## 📚 How to Use This Project

### For Developers

#### Backend Development
1. Read [README.md](README.md) → Architecture section
2. Reference [docs/API.md](docs/API.md) for endpoint contracts
3. Check `backend/docs/api.md` for implementation notes
4. Run backend: `cd backend && npm install && npm start`

#### Frontend Development
1. Read [README.md](README.md) → Feature sections
2. Review [Frontend/src/components/Main/](Frontend/src/components/Main/) for UI
3. Check [Frontend/src/services/](Frontend/src/services/) for API integration
4. Run frontend: `cd Frontend && npm install && npm start`

#### Testing Offline Features
1. Enable airplane mode on test device
2. Create message or location (should queue)
3. Disable airplane mode
4. Watch for sync notification
5. Verify item synced to database

### For QA Testers

1. Review [QA_CHECKLIST.md](QA_CHECKLIST.md)
2. Follow testing phases 1-14
3. Document bugs using template in QA_CHECKLIST.md
4. Cross-reference API details in [docs/API.md](docs/API.md)
5. Check database in MySQL workbench for data verification

### For Project Managers

1. Check [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) for status
2. Review [SESSION_COMPLETION.md](SESSION_COMPLETION.md) for deliverables
3. Check [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for phase status
4. Reference effort estimates for planning Phase 3

---

## 🔑 Key Concepts

### Delivery Modes
- **Centralizado**: Backend stores all messages, users query backend
- **Descentralizado**: P2P delivery via Wi-Fi Direct (architecture documented)

### Message Policies
- **Public**: Anyone can receive
- **Whitelist**: Only specified users can receive
- **Blacklist**: Anyone except specified users can receive

### Mule System
- **Purpose**: Relay node for extending message reach to distant recipients
- **Registration**: User can become mule with capacity setting
- **Assignments**: Backend assigns messages to mules
- **Acceptance**: Mule accepts assignment and records delivery

### Offline Queue
- **Messages**: Queued in AsyncStorage, retried on reconnect
- **Locations**: Queued separately, retried with batch retry
- **Monitoring**: NetInfo monitors connectivity, triggers auto-retry

---

## 🚀 Quick Start

### Setup Backend
```bash
cd backend
npm install
npm run init-db              # Initialize MySQL database
npm start                    # Start on localhost:3000
```

### Setup Frontend
```bash
cd Frontend
npm install
npm start                    # Start Expo server
# Scan QR code in Expo Go app
```

### Run First Test
1. Open app in Expo Go
2. Register new account
3. Login
4. Create GPS location
5. Create message referencing location
6. Switch to another test user account
7. See message in Received tab
8. Tap Receive to mark as delivered

---

## 🔗 API Quick Reference

### Authentication
- `POST /api/auth/register` → Create account
- `POST /api/auth/login` → Get JWT token

### Messages
- `POST /api/messages` → Create message
- `GET /api/messages` → List user's messages
- `GET /api/messages/nearby` → Find nearby messages
- `POST /api/messages/:id/receive` → Record delivery

### Mules
- `GET /api/mules/assignments` → List pending tasks
- `POST /api/mules/assignments/:id/accept` → Accept delivery
- `GET /api/mules/config` → Get mule settings
- `POST /api/mules/config` → Register/update mule
- `GET /api/mules/stats` → Get performance metrics

For complete API reference, see [docs/API.md](docs/API.md).

---

## 📞 Troubleshooting

### Common Issues

**Q: Message not appearing in received tab**
- Check message policy (might be blacklisted)
- Verify location exists and is saved
- Check database that message was created

**Q: Offline queue not syncing**
- Enable flight mode, create item, disable flight mode
- Watch for sync notification
- Check AsyncStorage in React Native debugger

**Q: Mule stats showing zero**
- Create messages and have mule accept them
- Check mulas_mensagens table for delivery records
- Verify getUserStats query is correct

**Q: Map not displaying**
- Check Google Maps API key in backend config
- Verify locations have valid coordinates
- Check that GPS permission granted on device

For more troubleshooting, see [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) Troubleshooting section.

---

## 📈 What's Next?

### Immediate (This Week)
1. Run QA checklist on real devices
2. Fix any bugs found
3. Plan Wi-Fi Direct P2P implementation

### Short-term (This Month)
1. Implement Wi-Fi Direct P2P library
2. Add user blocking feature
3. Implement message encryption

### Long-term (This Quarter)
1. Multi-hop routing
2. Mesh networking
3. Admin dashboard
4. Analytics platform

---

## 📄 Document Relationship Map

```
README.md (START)
    ├─→ docs/API.md (API contracts)
    ├─→ IMPLEMENTATION_STATUS.md (Architecture)
    ├─→ FEATURE_ROADMAP.md (Status & roadmap)
    ├─→ QA_CHECKLIST.md (Testing guide)
    ├─→ SESSION_COMPLETION.md (Deliverables)
    └─→ This file (Navigation guide)

Backend Code
    └─→ backend/docs/api.md (Implementation notes)

Frontend Code
    └─→ Frontend/src/services/ (API integration)
    └─→ Frontend/src/components/ (UI screens)
```

---

## 📞 Support

### For Questions About...

| Topic | See Document |
|-------|--------------|
| Overall architecture | README.md |
| API endpoints | docs/API.md |
| Testing procedures | QA_CHECKLIST.md |
| Feature status | FEATURE_ROADMAP.md |
| What was delivered | SESSION_COMPLETION.md |
| Implementation patterns | IMPLEMENTATION_STATUS.md |
| Wi-Fi Direct details | README.md "Wi-Fi Direct" section |
| Offline queue | IMPLEMENTATION_STATUS.md "Offline Queue" |
| Database schema | IMPLEMENTATION_STATUS.md "Database Schema" |

---

**Last Updated**: January 2024  
**Project Phase**: MVP Complete, Beta In Progress  
**Next Milestone**: QA Testing & Phase 2 Completion
