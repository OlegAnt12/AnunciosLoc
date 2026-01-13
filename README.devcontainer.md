# Devcontainer (Docker Compose) for AnunciosLoc

This devcontainer runs two services using Docker Compose:

- `db`: MySQL 8 preloaded with `BD/AnunciosLoc.sql` (mounted into `/docker-entrypoint-initdb.d`) so the schema is initialized automatically.
- `app`: Node.js development container where you can run tests and the API server.

Quick start

1. In VS Code, open the repo and choose "Reopen in Container" (requires Remote - Containers extension).
2. The container will build and start. The `postCreateCommand` will:
   - `cd backend && npm install`
   - Wait for the `db` service to be ready
   - Run `npm run db:init` (it will use the `mysql` client inside the `app` container to import `BD/AnunciosLoc.sql`).

If you prefer to run locally in a terminal (without VS Code devcontainer):

1. Ensure Docker and Docker Compose are installed.
2. From the repository root run (Makefile added for convenience):

   make up

3. Enter the app container (optional):

   make shell-app

4. Start Expo (LAN) from inside the container or use the helper Make target:

   make start-expo       # Runs the helper inside the app container
   # Or run locally (host):
   make start-expo-local

5. Install dependencies and run tests (from inside the container):

   make test-backend

Notes

- There's an npm script in the Frontend to start Expo in LAN mode using the helper script:
  - `cd Frontend && npm run start:lan` (this runs `../scripts/start-expo.sh`).
- VS Code task: open the Command Palette and run `Tasks: Run Task` → `Start Expo (LAN)` to start Expo from the editor.

Using physical devices (phones / tablets) on the same LAN or via USB (Expo Go)

- Option A — Use published ports (recommended, works on all OSes):
  - The `app` service publishes the API at `http://<host-ip>:3000` and Metro at `19000-19002` (Expo). Find your host machine IP with `ip a` / `ifconfig` / `ipconfig` and use it on the device.
  - Start Expo from the `Frontend` folder inside the app container or on the host:

    cd Frontend
    npm install
    # Preferred: use LAN mode and set packager host (recommended for Expo Go on physical devices)
    REACT_NATIVE_PACKAGER_HOSTNAME=<host-ip> npx expo start --lan

  - If you prefer automatic handling, use the helper script from the repo root (inside the container):

    ./scripts/start-expo.sh

  - Ensure your phone and your dev machine are on the same Wi‑Fi network and use **Expo Go** to scan the QR code shown in the Metro/Expo console.
  - If you run into CORS issues, set `ALLOWED_ORIGINS` (environment variable in `docker-compose.yml`) to include your device IP or `*` for development.

- Option B — Use host networking (Linux only):
  - Use the host override to make containers share the host network (no port mappings required):

    docker compose -f docker-compose.yml -f docker-compose.override.host.yml up --build

  - This is helpful when physical devices need direct access to services on the host.

- Option C — Use USB & adb (Android):
  - Connect your Android device via USB to the host machine.
  - On the host, run `adb devices` to confirm the device is connected.
  - Use `adb reverse tcp:3000 tcp:3000` and `adb reverse tcp:19000 tcp:19000` if needed so the device can reach the containerized services via `localhost`.

Expo-specific notes

- Expo Go expects Metro to advertise a host/IP that the mobile device can reach. Use `--lan` mode and set `REACT_NATIVE_PACKAGER_HOSTNAME` to your host IP (or use `--tunnel` which works without network config but can be slower).
- You can run Expo inside the app container and scan the QR code from your device. If you prefer to run Expo on the host, point Expo to `http://<host-ip>:19000`.
- If the device cannot scan the QR code, you can use the URL or manually enter the IP shown in the Metro output.

Notes and tips

- The backend binds to the container interface and Docker publishes it on the host; using `http://<host-ip>:3000` in your mobile app or `ALLOWED_ORIGINS` is usually the simplest setup.
- If you use the VS Code devcontainer, be aware that some device connection workflows (e.g., USB forwarding with `adb`) must be performed on the host machine rather than inside the container—devcontainer acts as an environment for code and services but device USB forwarding is host-level.
- If you have trouble connecting, try temporarily adding `ALLOWED_ORIGINS: "*"` to the `app` service environment and use host networking if on Linux.

Notes

- The DB credentials for the devcontainer are:
  - host: `db`
  - port: `3306`
  - user: `root`
  - password: `rootpwd`
  - database: `anunciosloc`

- The `db:init` script uses the `mysql` CLI. The `app` image includes a MySQL client to support this.

- If you want to reinitialize the DB, remove the `db` service's volume so MySQL re-runs the init scripts (or change the mounted file).

If you want, I can also add a small Makefile or npm script at the repo root to run common dev tasks (start compose, stop, shell into app, run tests).
