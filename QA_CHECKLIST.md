# AnunciosLoc - QA Testing Checklist

## Pre-Testing Setup
- [ ] Clone latest code from main branch
- [ ] Run `npm install` in both backend and frontend directories
- [ ] Ensure MySQL database is running and initialized (run `npm run init-db` in backend)
- [ ] Start backend server: `npm start` (backend folder)
- [ ] Configure frontend `api.js` with correct backend URL (http://localhost:3000 for local testing)
- [ ] Install Expo Go app on test devices (iOS/Android)
- [ ] Run frontend: `npm start` in Frontend folder and open on Expo Go

---

## Phase 1: Authentication & Session Management

### Test 1.1: User Registration
- [ ] Open app and see "Register" screen
- [ ] Fill in email, password, confirm password, and name fields
- [ ] Verify password confirmation validation (error if mismatch)
- [ ] Submit valid registration form
- [ ] Verify success alert and redirect to login screen
- [ ] Try registering with same email again → verify error response
- [ ] Verify new user is created in database (check MySQL `users` table)

### Test 1.2: User Login
- [ ] Enter valid email and password from registered user
- [ ] Verify JWT token is received and stored
- [ ] Verify redirect to main app (HomeScreen)
- [ ] Test with incorrect password → verify error message
- [ ] Test with non-existent email → verify error message

### Test 1.3: Session Persistence
- [ ] Login to app
- [ ] Kill and restart app
- [ ] Verify user is still logged in (no need to re-login)
- [ ] Verify token is still valid
- [ ] Logout from app
- [ ] Restart app
- [ ] Verify back on login screen

### Test 1.4: Logout
- [ ] Login to app
- [ ] Navigate to Profile screen
- [ ] Tap logout/exit button
- [ ] Verify redirect to login screen
- [ ] Verify token is cleared from AsyncStorage

### Test 1.5: Token Expiration
- [ ] Login to app
- [ ] Manually expire token in database (set expires_at to past date)
- [ ] Try to make API request (e.g., refresh notifications)
- [ ] Verify 401 response and redirect to login screen

---

## Phase 2: Profile Management

### Test 2.1: View Profile
- [ ] Login to app
- [ ] Navigate to Profile tab
- [ ] Verify user name, email, phone, bio, avatar displayed
- [ ] Verify data matches what was entered during registration

### Test 2.2: Edit Profile
- [ ] From Profile screen, tap edit button/pencil icon
- [ ] Update name, email, phone, bio fields
- [ ] Submit changes
- [ ] Verify success alert
- [ ] Verify changes persist after app restart
- [ ] Verify changes reflected in database

### Test 2.3: Profile Image (if implemented)
- [ ] Tap on avatar/profile picture
- [ ] Select new image from gallery or take photo
- [ ] Verify image uploads to server
- [ ] Verify image displays in profile
- [ ] Verify persistence after restart

---

## Phase 3: Location Management

### Test 3.1: Create GPS Location
- [ ] Navigate to Locations screen
- [ ] Tap "Add Location" button
- [ ] Select "GPS" type
- [ ] Set name: "Test Park"
- [ ] Tap map or enter coordinates manually (e.g., 38.736, -9.143)
- [ ] Set radius to 500m
- [ ] Submit
- [ ] Verify location appears in list
- [ ] Verify location saved in database with correct coordinates
- [ ] Tap on location in list to verify map displays correct marker

### Test 3.2: Create Wi-Fi Location
- [ ] Tap "Add Location"
- [ ] Select "WIFI" type
- [ ] Set name: "Coffee Shop"
- [ ] Tap "Scan SSIDs" button
- [ ] Select one or more SSID from nearby networks
- [ ] Submit
- [ ] Verify location appears in list with selected SSIDs
- [ ] Verify saved in database with SSID list

### Test 3.3: Edit Location
- [ ] Tap on existing location in list
- [ ] Tap edit button
- [ ] Change name, coordinates, or SSIDs
- [ ] Submit changes
- [ ] Verify changes persist
- [ ] Verify database updated

### Test 3.4: Delete Location
- [ ] Tap on location
- [ ] Tap delete button
- [ ] Confirm deletion in alert
- [ ] Verify location removed from list
- [ ] Verify location removed from database

### Test 3.5: Map Display
- [ ] With multiple locations, verify all markers appear on map
- [ ] Tap on marker to see location info popup
- [ ] Zoom in/out and verify markers scale correctly
- [ ] Verify user current location (blue dot) displays if permissions granted

---

## Phase 4: Message System - Centralized Mode

### Test 4.1: Create Message (Centralized, Public)
- [ ] Navigate to Messages screen
- [ ] Tap "Create Message" button
- [ ] Fill in:
  - Title: "Test Event"
  - Content: "Meeting tomorrow at 3pm"
  - Delivery Mode: **Centralizado**
  - Policy Type: **Public**
- [ ] Create inline GPS location (or reference existing)
- [ ] Submit
- [ ] Verify success alert
- [ ] Verify message appears in "Sent" tab
- [ ] Verify message stored in database with correct mode/policy

### Test 4.2: Create Message with Whitelist Policy
- [ ] Create new message with:
  - Policy Type: **Whitelist**
  - Add policy rules (usernames who can receive)
- [ ] Submit
- [ ] Verify policy_mensagens entries created in database for allowed users
- [ ] Login as non-whitelisted user → verify message NOT visible in received messages
- [ ] Login as whitelisted user → verify message visible in received messages

### Test 4.3: Create Message with Blacklist Policy
- [ ] Create message with Policy Type: **Blacklist**
- [ ] Add blocked usernames
- [ ] Submit
- [ ] Login as blocked user → verify message not visible
- [ ] Login as other user → verify message visible

### Test 4.4: Receive Message (as Different User)
- [ ] Create message from User A (Centralizado, Public)
- [ ] Logout from User A
- [ ] Login as User B
- [ ] Navigate to "Received" tab in Messages screen
- [ ] Verify message from User A appears in list
- [ ] Tap on message to see full content and details

### Test 4.5: Mark Message as Read/Received
- [ ] As User B, tap "Receive" button on message
- [ ] Verify message marked as delivered
- [ ] Verify delivery recorded in entregas_mensagens table
- [ ] Verify notification logged in logs_mensagens

### Test 4.6: Nearby Messages Tab
- [ ] Create message from User A with GPS location (e.g., 38.736, -9.143)
- [ ] Login as User B with location near that area (within radius)
- [ ] Go to Messages screen → Nearby tab
- [ ] Verify message from User A appears as "nearby"
- [ ] Verify distance calculated correctly

---

## Phase 5: Message System - Decentralized Mode

### Test 5.1: Create Message (Descentralizado)
- [ ] Create message with Delivery Mode: **Descentralizado**
- [ ] Add inline Wi-Fi location with SSID
- [ ] Submit
- [ ] Verify message stored with modo_entrega = "Descentralizado"

### Test 5.2: P2P Message Reception (Manual)
- [ ] With message in Descentralizado mode
- [ ] Navigate to Nearby tab
- [ ] If another device is nearby, should appear in nearby messages
- [ ] Verify "Receive" action works and records delivery
- [ ] Note: Full Wi-Fi Direct P2P implementation requires library installation (future)

---

## Phase 6: Notifications System

### Test 6.1: View Notifications List
- [ ] Create and receive multiple messages as User B
- [ ] Navigate to Notifications tab
- [ ] Verify list shows all received messages/notifications
- [ ] Verify unread count badge appears on tab

### Test 6.2: Mark Single Notification as Read
- [ ] In Notifications screen, tap on notification item
- [ ] Verify visual change (fade, checkmark, etc.)
- [ ] Verify marked as read in database (logs_mensagens.seen != NULL)

### Test 6.3: Mark All as Read
- [ ] With multiple unread notifications
- [ ] Tap "Mark All as Read" button
- [ ] Verify all notifications marked as read
- [ ] Verify badge count resets to 0

### Test 6.4: Delete Notification
- [ ] Tap delete/trash icon on notification
- [ ] Confirm deletion in alert
- [ ] Verify notification removed from list
- [ ] Verify still queryable in backend but marked as deleted

---

## Phase 7: Mule/Relay System

### Test 7.1: Register as Mule
- [ ] Navigate to Mules screen
- [ ] Tap "Configuration" tab
- [ ] Tap "Register as Mule" or similar button
- [ ] Set capacity: 20 messages
- [ ] Tap Save
- [ ] Verify mula entry created in database
- [ ] Verify capacity stored

### Test 7.2: View Mule Assignments
- [ ] With User A registered as mule
- [ ] Create message from User C targeting a distant location
- [ ] System assigns message to mule (User A)
- [ ] As User A, go to Mules screen → Assignments tab
- [ ] Verify message assignment listed
- [ ] Verify assignment shows title, location, priority

### Test 7.3: Accept Mule Assignment
- [ ] Tap "Accept" on assignment
- [ ] Confirm in alert
- [ ] Verify assignment removed from list
- [ ] Verify delivery recorded in entregas_mensagens
- [ ] Verify status changed in mulas_mensagens to "delivered"

### Test 7.4: View Mule Statistics
- [ ] As mule, go to Configuration tab
- [ ] Verify statistics card shows:
  - Total assignments
  - Delivered count
  - Pending count
  - Average delivery time (if available)
- [ ] Verify stats match database aggregates

### Test 7.5: Update Mule Capacity
- [ ] Change capacity slider to different value
- [ ] Tap Save
- [ ] Verify capacity updated in database
- [ ] Logout and login → verify persisted

### Test 7.6: Unregister as Mule
- [ ] Tap "Remove" button in Configuration tab
- [ ] Confirm in alert
- [ ] Verify mula entry deleted/deactivated in database
- [ ] Verify no more assignments visible

---

## Phase 8: Offline Queue System

### Test 8.1: Create Message While Offline
- [ ] Enable airplane mode on test device
- [ ] Navigate to Messages screen
- [ ] Create new message (all fields valid)
- [ ] Submit
- [ ] Verify "Message queued" alert instead of "Message created"
- [ ] Verify AsyncStorage contains queued message
- [ ] Disable airplane mode
- [ ] Verify message automatically sent to backend
- [ ] Verify "Offline sync" notification appears

### Test 8.2: Create Location While Offline
- [ ] Enable airplane mode
- [ ] Go to Locations screen
- [ ] Add new GPS location
- [ ] Tap Submit
- [ ] Verify "Location queued" alert
- [ ] Disable airplane mode
- [ ] Verify location synced to backend

### Test 8.3: Queue Retry Mechanism
- [ ] Queue 3-5 messages while offline
- [ ] Go online
- [ ] Verify all queued messages sent in batch
- [ ] Verify database shows all messages created
- [ ] Verify queue cleared from AsyncStorage

### Test 8.4: Duplicate Prevention
- [ ] Queue message while offline
- [ ] Go online (message syncs)
- [ ] Manually trigger sync again
- [ ] Verify duplicate not created in database

---

## Phase 9: UI/UX Testing

### Test 9.1: Theme Consistency
- [ ] Navigate through all screens
- [ ] Verify consistent color scheme (orange #FF6B35, grays)
- [ ] Verify text sizes readable
- [ ] Verify icons clear and intuitive

### Test 9.2: Navigation
- [ ] Tab navigation working smoothly
- [ ] Back button behavior consistent
- [ ] Modals open/close correctly
- [ ] No navigation loops or dead ends

### Test 9.3: Form Validation
- [ ] All form fields validate before submission
- [ ] Error messages clear and actionable
- [ ] Loading spinners display during API calls
- [ ] Disabled buttons during processing

### Test 9.4: List Performance
- [ ] Lists scroll smoothly with many items (100+)
- [ ] No lag or freezing
- [ ] Pull-to-refresh works on all list screens

---

## Phase 10: API & Backend Testing

### Test 10.1: API Request Headers
- [ ] Use browser DevTools or Charles Proxy to inspect API requests
- [ ] Verify Authorization header contains valid JWT token
- [ ] Verify Content-Type is application/json

### Test 10.2: Error Responses
- [ ] Attempt API call with expired token
- [ ] Verify 401 response and user logout
- [ ] Attempt invalid data submission
- [ ] Verify 400 response with validation errors
- [ ] Attempt unauthorized access (e.g., delete another user's message)
- [ ] Verify 403 response

### Test 10.3: Database Integrity
- [ ] Verify foreign key constraints (user_id references exist)
- [ ] Verify no orphaned records after deletion
- [ ] Verify transaction rollback if error occurs during multi-step operations

### Test 10.4: Rate Limiting
- [ ] Rapidly submit registration requests
- [ ] Verify rate limit kicks in after threshold
- [ ] Verify 429 (Too Many Requests) response

---

## Phase 11: Security Testing

### Test 11.1: Password Storage
- [ ] Hash in database should not be plaintext
- [ ] Try logging in with hashed password (should fail)
- [ ] Verify bcrypt or similar used

### Test 11.2: CORS Configuration
- [ ] Frontend on http://localhost:19006 should work
- [ ] External domain requesting should be blocked

### Test 11.3: Token Security
- [ ] Token should expire after set time (e.g., 24 hours)
- [ ] Token refresh mechanism (if implemented) should work
- [ ] Logging out should invalidate token

### Test 11.4: SQL Injection
- [ ] Try adding SQL characters in message content: `'; DROP TABLE users; --`
- [ ] Verify message saved as-is, no SQL execution
- [ ] Backend should escape/parameterize queries

---

## Phase 12: Performance & Load Testing

### Test 12.1: Startup Time
- [ ] From cold start to login screen: < 3 seconds
- [ ] From login to main app: < 2 seconds

### Test 12.2: API Response Times
- [ ] Message creation: < 1 second
- [ ] Location list load: < 1 second
- [ ] Notification sync: < 500ms

### Test 12.3: Memory Usage
- [ ] Monitor RAM while scrolling through long lists
- [ ] Verify no memory leaks (RAM gradually increasing)
- [ ] Verify memory released on navigation

### Test 12.4: Concurrent Operations
- [ ] Create message while location list loading
- [ ] Switch between tabs rapidly
- [ ] No crashes or errors

---

## Phase 13: Wi-Fi Direct P2P (If Implemented)

### Test 13.1: SSID Detection
- [ ] Create Wi-Fi location with SSID from test AP
- [ ] Verify SSID appears in nearby locations
- [ ] Verify delivery possible to detected SSID

### Test 13.2: P2P Message Transmission
- [ ] Send message in Descentralizado mode with SSID
- [ ] Connect second device to same SSID
- [ ] Verify message appears in Nearby for second device
- [ ] Verify delivery without backend involvement

### Test 13.3: Range Testing
- [ ] Test P2P at various distances (10m, 30m, 100m)
- [ ] Verify connection drops at range limits
- [ ] Verify connection re-established when in range

---

## Phase 14: Device-Specific Testing

### Test 14.1: Android Testing
- [ ] Test on Android 10, 12, 14 (various versions)
- [ ] Verify permissions requested properly (location, contacts, camera)
- [ ] Verify back button behavior
- [ ] Verify hardware keyboard shortcuts (if any)

### Test 14.2: iOS Testing (if applicable)
- [ ] Test on iOS 15, 16, 17+
- [ ] Verify permissions popup works
- [ ] Verify home indicator doesn't interfere with UI
- [ ] Verify notch/dynamic island compatibility

### Test 14.3: Screen Size Variations
- [ ] Test on small phone (5.5")
- [ ] Test on large phone (6.5"+)
- [ ] Test on tablet (if supported)
- [ ] Verify no text cutoff or overlapping

---

## Regression Testing (After Each Change)

- [ ] All critical path tests (Auth → Create Message → Receive)
- [ ] All offline scenarios
- [ ] Mule accept flow
- [ ] Notification updates
- [ ] Navigation consistency

---

## Bug Reporting Template

When bugs are found:

```
**Title**: [Component] Brief description of issue

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
What should happen

**Actual Result**:
What actually happened

**Environment**:
- Device: [iPhone 14 / Samsung S23 / etc]
- OS Version: [iOS 17 / Android 14 / etc]
- App Version: [1.0.0]
- Backend: [Local / Staging / Production]

**Attachments**:
- Screenshot / Video
- Error log if available
```

---

## Sign-Off

- QA Tester Name: ___________________
- Date: ___________________
- Overall Result: ☐ PASS  ☐ FAIL
- Known Issues: _______________________________
- Recommendations: _______________________________

---

**Testing Duration**: Estimated 4-6 hours for full QA cycle  
**Last Updated**: January 2024
