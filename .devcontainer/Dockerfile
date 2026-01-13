FROM node:18-bullseye

# Install mysql client and netcat for health & wait scripts
RUN apt-get update && apt-get install -y default-mysql-client netcat && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspaces/AnunciosLoc

# Default command keeps the container running for VS Code to attach
CMD ["sleep","infinity"]
