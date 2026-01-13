# Convenience Makefile for dev tasks
.PHONY: up down build logs shell-app shell-db start-expo test-backend

DOCKER_COMPOSE := docker compose -f .devcontainer/docker-compose.yml

up:
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down

build:
	$(DOCKER_COMPOSE) build --no-cache

logs:
	$(DOCKER_COMPOSE) logs -f

shell-app:
	$(DOCKER_COMPOSE) exec app /bin/bash

shell-db:
	$(DOCKER_COMPOSE) exec db /bin/bash

start-expo:
	$(DOCKER_COMPOSE) exec app sh /workspaces/AnunciosLoc/scripts/start-expo.sh

test-backend:
	$(DOCKER_COMPOSE) exec app bash -lc "cd backend && npm ci && npm run test:ci"

# For local convenience (when not using docker compose)
start-expo-local:
	cd Frontend && REACT_NATIVE_PACKAGER_HOSTNAME=$$(hostname -I | awk '{print $$1}') npx expo start --lan
