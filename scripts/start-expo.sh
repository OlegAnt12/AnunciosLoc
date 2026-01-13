#!/usr/bin/env bash
set -euo pipefail

# Helper to start Expo inside the app container with the correct host IP
# Usage: ./scripts/start-expo.sh

# Determine the host IP accessible from devices (attempt common interfaces)
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$HOST_IP" ]; then
  # Fallbacks
  HOST_IP=$(ip route get 1 | awk '{print $7;exit}') || true
fi

if [ -z "$HOST_IP" ]; then
  echo "❌ Could not detect host IP. Please set REACT_NATIVE_PACKAGER_HOSTNAME manually."
  exit 1
fi

echo "➡️ Starting Expo (host IP: $HOST_IP)"
cd Frontend
export REACT_NATIVE_PACKAGER_HOSTNAME=$HOST_IP
# Use npx so local expo binary is used
npx expo start --lan
