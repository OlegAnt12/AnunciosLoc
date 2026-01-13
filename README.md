"# AnunciosLoc

AnunciosLoc — sistema de anúncios baseado em localização.

## Resumo

Este repositório contém o backend (Node.js/Express + MySQL) e o frontend (Expo / React Native) para um sistema de anúncios que entrega mensagens com base em localização GPS/Wi‑Fi e políticas (whitelist/blacklist).

## Rápido arranque (Dev)

Recomendo usar o devcontainer fornecido (VS Code Remote - Containers) com Docker Compose que lança um serviço MySQL e um container de desenvolvimento Node.

1. Abra o repositório no VS Code e selecione **Reopen in Container**.
2. O devcontainer irá instalar dependências, aguardar o MySQL e executar `npm run db:init` para importar `BD/AnunciosLoc.sql`.
3. Para iniciar o front-end Expo com suporte a dispositivos físicos:
   - No container app execute: `make start-expo` ou `cd Frontend && npm run start:lan`.
   - Use **Expo Go** no dispositivo para escanear o QR code (modo LAN) ou usar o URL.

Se preferir não usar o devcontainer, utilize o Makefile localmente (requere Docker e Docker Compose):

  make up           # sobe a stack (app + db)
  make shell-app    # abre shell no container app
  make start-expo   # começa o Metro/Expo dentro do container
  make test-backend # executa testes backend (usa docker-compose)

> Dica: para dispositivos físicos, use o IP do host (ex.: `http://<host-ip>:3000`) ou o host networking override (Linux) conforme descrito em `.devcontainer/README.devcontainer.md`.

## Testes e CI

- Tests backend com Jest + Supertest estão no `backend/tests/`.
- Um workflow GitHub Actions (`.github/workflows/ci.yml`) inicializa um serviço MySQL, importa o schema e executa os testes.
- Local (via container): `make test-backend`.

## Pontos já implementados (últimas alterações)

- Mapeamento e alinhamento do backend com o schema MySQL (`BD/AnunciosLoc.sql`).
- `backend/config/database.js` com helpers de transação e `end()` para testes.
- Endpoints e controllers cobrindo `auth`, `profiles`, `messages`, `locations`, `notifications`, `devices`, `stats`.
- Serviços de backend com transações e uso de stored procedures quando aplicável.
- Devcontainer com MySQL e inicialização automática do schema.
- Helper de Expo (`scripts/start-expo.sh`) e `Frontend/package.json` com script `start:lan`.
- Makefile com tarefas convenientes (up/down/start-expo/test-backend).
- Tests adicionados: `auth.test.js`, `profile.test.js`, `messages.test.js`, `locations.test.js`, `notifications.test.js`.

## Próximos passos

- Finalizar auditoria e cobertura de testes (mais casos limites, validações e edge cases).
- Corrigir eventuais falhas detectadas pelo CI e adicionar testes para fluxos complexos (políticas, mulas, entrega offline).
- Preparar PR com changelog e instruções de revisão.

