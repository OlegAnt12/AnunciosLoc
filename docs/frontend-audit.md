# Frontend API Audit — initial findings

Date: 2026-01-14

## Scope
Map frontend API usage (calls in `Frontend/src`) to backend endpoints and note mismatches / suggested fixes.

## Summary
- Most frontend API calls map cleanly to backend routes.
- No existing UI components currently use notifications endpoints; backend has notifications endpoints implemented.
- Minor naming differences are supported by backend (`/api/messages` vs `/api/users/:id/messages`) — backend exposes both variants.

## Endpoint mapping (important ones)
- Auth
  - Frontend: POST `/auth/register`, POST `/auth/login` → Backend: `/api/auth/register`, `/api/auth/login` ✅
- Messages
  - Create: POST `/messages` → Backend: POST `/api/messages` ✅
  - Received: GET `/users/:id/messages` → Backend: GET `/api/users/:id/messages` ✅
  - Sent: GET `/users/:id/sent-messages` → Backend: GET `/api/users/:id/sent-messages` ✅
  - Nearby: POST `/messages/nearby` → Backend: POST `/api/messages/nearby` ✅
- Locations
  - Create: POST `/locations` → Backend: POST `/api/locations` ✅
  - User locations: GET `/users/:id/locations` → Backend: GET `/api/users/:id/locations` ✅
- Profiles
  - Add key: POST `/profiles/key` → Backend: POST `/api/profiles/key` ✅
  - Remove key: DELETE `/profiles/key` (body payload) → Backend supports DELETE `/api/profiles/key` ✅
- Notifications (new)
  - GET `/notifications` → Backend: GET `/api/notifications` ✅
  - GET `/notifications/count` → Backend: GET `/api/notifications/count` ✅
  - POST `/notifications` → Backend: POST `/api/notifications` ✅
  - DELETE `/notifications/:id` → Backend: DELETE `/api/notifications/:id` ✅
  - PUT `/notifications/:id/read` → Backend: PUT `/api/notifications/:id/read` ✅

## Notes / Next steps
- Added UI: created `Notifications` tab and screen (list, mark-as-read, delete) and a small `notificationService` to make integration straightforward.
- Added a `Notifications` tab in the app using the existing `IconSymbol` and preserved the app's theming (`ThemedText`, `ThemedView`, shared styles).
- Added a `NotificationsProvider` that polls the unread count and exposes `count`/`refreshCount` for the app; added a dynamic badge in the tab bar to surface unread notifications.
- Next: run dynamic tests (Expo + backend) to verify runtime behaviours (user flows, auth tokens and protected routes) — will proceed once CI is green as requested.

