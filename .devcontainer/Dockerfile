# usa uma base Debian/Ubuntu com Node LTS pré-instalado
FROM node:18-bullseye-slim

# tools úteis para compilar módulos nativos (se necessário)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential python3 curl ca-certificates postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# criar workspace user (same UID as codespace)
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

RUN groupadd --gid $USER_GID $USERNAME \
 && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
 && apt-get update

WORKDIR /workspaces/${GITHUB_REPOSITORY#*/}
USER $USERNAME

# se existirem, instala deps automaticamente
COPY --chown=vscode:vscode package*.json . 2>/dev/null || true

# Nota: a postCreateCommand de devcontainer executa npm install
