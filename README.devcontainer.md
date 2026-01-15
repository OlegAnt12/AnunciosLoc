# Devcontainer (Docker Compose) para AnunciosLoc

Este devcontainer executa dois serviços usando Docker Compose:

- `db`: MySQL 8 pré-carregado com `BD/AnunciosLoc.sql` (montado em `/docker-entrypoint-initdb.d`) para que o esquema seja inicializado automaticamente.
- `app`: Contêiner de desenvolvimento Node.js onde você pode executar testes e servidor API.

Início rápido

1. No VS Code, abra o repositório e escolha "Reopen in Container" (requer extensão Remote - Containers).
2. O contêiner será construído e iniciado. O `postCreateCommand` irá:
   - `cd backend && npm install`
   - Aguardar o serviço `db` estar pronto
   - Executar `npm run db:init` (ele usará o cliente `mysql` dentro do contêiner `app` para importar `BD/AnunciosLoc.sql`).

Se preferir executar localmente em um terminal (sem devcontainer VS Code):

1. Garanta que Docker e Docker Compose estejam instalados.
2. Do diretório raiz do repositório execute (Makefile adicionado para conveniência):

   make up

3. Entre no contêiner app (opcional):

   make shell-app

4. Inicie Expo (LAN) de dentro do contêiner ou use o auxiliar Make target:

   make start-expo       # Executa o auxiliar dentro do contêiner app
   # Ou execute localmente (host):
   make start-expo-local

5. Instale dependências e execute testes (de dentro do contêiner):

   make test-backend

Notas

- Há um script npm na Frontend para iniciar Expo em modo LAN usando o script auxiliar:
  - `cd Frontend && npm run start:lan` (executa `../scripts/start-expo.sh`).
- Tarefa VS Code: abra a Paleta de Comandos e execute `Tasks: Run Task` → `Start Expo (LAN)` para iniciar Expo do editor.

Usando dispositivos físicos (telefones/tablets) na mesma LAN ou via USB (Expo Go)

- Opção A — Use portas publicadas (recomendado, funciona em todos OSes):
  - O serviço `app` publica a API em `http://<ip-host>:3000` e Metro em `19000-19002` (Expo). Encontre o IP da máquina host com `ip a` / `ifconfig` / `ipconfig` e use no dispositivo.
  - Inicie Expo da pasta `Frontend` dentro do contêiner app ou no host:

    cd Frontend
    npm install
    # Preferido: use modo LAN e defina host packager (recomendado para Expo Go em dispositivos físicos)
    REACT_NATIVE_PACKAGER_HOSTNAME=<ip-host> npx expo start --lan

  - Se preferir manipulação automática, use o script auxiliar do repositório raiz (dentro do contêiner):

    ./scripts/start-expo.sh

  - Garanta que seu telefone e máquina dev estejam na mesma rede Wi-Fi e use **Expo Go** para escanear o QR code mostrado no console Metro/Expo.
  - Se encontrar problemas CORS, defina `ALLOWED_ORIGINS` (variável de ambiente em `docker-compose.yml`) para incluir o IP do dispositivo ou `*` para desenvolvimento.

- Opção B — Use rede host (Linux apenas):
  - Use o override host para fazer contêineres compartilharem a rede host (sem mapeamentos de porta necessários):

    docker compose -f docker-compose.yml -f docker-compose.override.host.yml up --build

  - Isso é útil quando dispositivos físicos precisam de acesso direto aos serviços no host.

- Opção C — Use USB & adb (Android):
  - Conecte seu dispositivo Android via USB à máquina host.
  - No host, execute `adb devices` para confirmar o dispositivo conectado.
  - Use `adb reverse tcp:3000 tcp:3000` e `adb reverse tcp:19000 tcp:19000` se necessário para que o dispositivo alcance os serviços conteinerizados via `localhost`.

Notas específicas do Expo

- Expo Go espera que Metro anuncie um host/IP que o dispositivo móvel possa alcançar. Use modo `--lan` e defina `REACT_NATIVE_PACKAGER_HOSTNAME` para o IP do host (ou use `--tunnel` que funciona sem configuração de rede, mas pode ser mais lento).
- Você pode executar Expo dentro do contêiner app e escanear o QR code do seu dispositivo. Se preferir executar Expo no host, aponte Expo para `http://<ip-host>:19000`.
- Se o dispositivo não puder escanear o QR code, use a URL ou insira manualmente o IP mostrado na saída Metro.

Notas e dicas

- O backend se liga à interface do contêiner e Docker publica no host; usar `http://<ip-host>:3000` no seu app móvel ou `ALLOWED_ORIGINS` geralmente é a configuração mais simples.
- Se usar o devcontainer VS Code, esteja ciente de que alguns fluxos de conexão de dispositivo (ex.: encaminhamento USB com `adb`) devem ser executados na máquina host em vez de dentro do contêiner—devcontainer age como um ambiente para código e serviços, mas encaminhamento USB de dispositivo é nível host.
- Se tiver problemas para conectar, tente adicionar temporariamente `ALLOWED_ORIGINS: "*"` ao ambiente do serviço `app` e use rede host se estiver no Linux.

Notas

- As credenciais DB para o devcontainer são:
  - host: `db`
  - porta: `3306`
  - usuário: `root`
  - senha: `rootpwd`
  - banco de dados: `anunciosloc`

- O script `db:init` usa o CLI `mysql`. A imagem `app` inclui um cliente MySQL para suportar isso.

- Se quiser reinicializar o DB, remova o volume do serviço `db` para que MySQL execute novamente os scripts init (ou mude o arquivo montado).

Se quiser, posso adicionar um pequeno Makefile ou script npm na raiz do repositório para executar tarefas comuns de dev (iniciar compose, parar, shell no app, executar testes).
