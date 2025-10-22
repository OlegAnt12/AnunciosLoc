FROM node:20-alpine

WORKDIR /usr/src/app

# instala dependências
COPY backend/package*.json ./
RUN npm install

# copia código
COPY backend/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
