# AnunciosLoc - Checklist de Testes QA

## Configuração Pré-Teste
- [ ] Clonar código mais recente da branch main
- [ ] Executar `npm install` em pastas backend e frontend
- [ ] Garantir que banco de dados MySQL esteja executando e inicializado (executar `npm run init-db` no backend)
- [ ] Iniciar servidor backend: `npm start` (pasta backend)
- [ ] Configurar `api.js` frontend com URL correta do backend (http://localhost:3000 para teste local)
- [ ] Instalar app Expo Go em dispositivos de teste (iOS/Android)
- [ ] Executar frontend: `npm start` na pasta Frontend e abrir no Expo Go

---

## Fase 1: Autenticação e Persistência de Sessão

### Teste 1.1: Registro de Usuário
- [ ] Abrir app e ver tela "Register"
- [ ] Preencher campos email, senha, confirmar senha e nome
- [ ] Verificar validação de confirmação de senha (erro se não corresponder)
- [ ] Submeter formulário de registro válido
- [ ] Verificar alerta de sucesso e redirecionamento para tela de login
- [ ] Tentar registrar com mesmo email novamente → verificar erro de resposta
- [ ] Verificar novo usuário criado no banco de dados (verificar tabela MySQL `users`)

### Teste 1.2: Login de Usuário
- [ ] Inserir email e senha válidos de usuário registrado
- [ ] Verificar token JWT recebido e armazenado
- [ ] Verificar redirecionamento para app principal (HomeScreen)
- [ ] Testar com senha incorreta → verificar mensagem de erro
- [ ] Testar com email inexistente → verificar mensagem de erro

### Teste 1.3: Persistência de Sessão
- [ ] Fazer login no app
- [ ] Matar e reiniciar app
- [ ] Verificar usuário ainda logado (sem necessidade de re-login)
- [ ] Verificar token ainda válido
- [ ] Fazer logout do app
- [ ] Reiniciar app
- [ ] Verificar de volta na tela de login

### Teste 1.4: Logout
- [ ] Fazer login no app
- [ ] Navegar para tela Profile
- [ ] Tocar no botão logout/exit
- [ ] Verificar redirecionamento para tela de login
- [ ] Verificar token limpo do AsyncStorage

### Teste 1.5: Expiração de Token
- [ ] Fazer login no app
- [ ] Expirar manualmente token no banco de dados (definir expires_at para passado)
- [ ] Tentar fazer solicitação de API (ex.: atualizar notificações)
- [ ] Verificar resposta 401 e redirecionamento para login

---

## Fase 2: Gerenciamento de Perfis

### Teste 2.1: Visualizar Perfil
- [ ] Fazer login no app
- [ ] Navegar para aba Profile
- [ ] Verificar nome de usuário, email, telefone, bio, avatar exibidos
- [ ] Verificar dados correspondem ao inserido durante registro

### Teste 2.2: Editar Perfil
- [ ] Da tela Profile, tocar no botão edit/pencil icon
- [ ] Atualizar campos nome, email, telefone, bio
- [ ] Submeter mudanças
- [ ] Verificar alerta de sucesso
- [ ] Verificar mudanças persistem após reinício do app
- [ ] Verificar mudanças refletidas no banco de dados

### Teste 2.3: Imagem de Perfil (se implementado)
- [ ] Tocar no avatar/imagem de perfil
- [ ] Selecionar nova imagem da galeria ou tirar foto
- [ ] Verificar imagem faz upload para servidor
- [ ] Verificar imagem exibe no perfil
- [ ] Verificar persistência após reinício

---

## Fase 3: Gerenciamento de Localização

### Teste 3.1: Criar Localização GPS
- [ ] Navegar para tela Locations
- [ ] Tocar "Add Location" button
- [ ] Selecionar tipo "GPS"
- [ ] Definir nome: "Parque Teste"
- [ ] Tocar no mapa ou inserir coordenadas manualmente (ex.: 38.736, -9.143)
- [ ] Definir raio para 500m
- [ ] Submeter
- [ ] Verificar localização aparece na lista
- [ ] Verificar localização salva no banco de dados com coordenadas corretas
- [ ] Tocar na localização na lista para verificar mapa exibe marcador correto

### Teste 3.2: Criar Localização Wi-Fi
- [ ] Tocar "Add Location"
- [ ] Selecionar tipo "WIFI"
- [ ] Definir nome: "Café WiFi"
- [ ] Tocar "Scan SSIDs" button
- [ ] Selecionar um ou mais SSID de redes próximas
- [ ] Submeter
- [ ] Verificar localização aparece na lista com SSIDs selecionados
- [ ] Verificar salvo no banco de dados com lista SSID

### Teste 3.3: Editar Localização
- [ ] Tocar em localização existente na lista
- [ ] Tocar botão edit
- [ ] Mudar nome, coordenadas ou SSIDs
- [ ] Submeter mudanças
- [ ] Verificar mudanças persistem
- [ ] Verificar banco de dados atualizado

### Teste 3.4: Excluir Localização
- [ ] Tocar em localização
- [ ] Tocar botão delete
- [ ] Confirmar exclusão no alerta
- [ ] Verificar localização removida da lista
- [ ] Verificar localização removida do banco de dados

### Teste 3.5: Exibição de Mapa
- [ ] Com múltiplas localizações, verificar todos marcadores aparecem no mapa
- [ ] Tocar em marcador para ver popup de info da localização
- [ ] Zoom in/out e verificar marcadores escalam corretamente
- [ ] Verificar localização atual do usuário (ponto azul) exibe se permissões concedidas

---

## Fase 4: Sistema de Mensagens - Modo Centralizado

### Teste 4.1: Criar Mensagem (Centralizado, Público)
- [ ] Navegar para tela Messages
- [ ] Tocar "Create Message" button
- [ ] Preencher:
  - Título: "Evento Teste"
  - Conteúdo: "Encontro amanhã às 3pm"
  - Modo de Entrega: **Centralizado**
  - Tipo de Política: **Público**
- [ ] Criar localização inline GPS (ou referenciar existente)
- [ ] Submeter
- [ ] Verificar alerta de sucesso
- [ ] Verificar mensagem aparece na aba "Sent"
- [ ] Verificar mensagem armazenada no banco de dados com modo/política corretos

### Teste 4.2: Criar Mensagem com Política Whitelist
- [ ] Criar nova mensagem com:
  - Tipo de Política: **Whitelist**
  - Adicionar regras de política (usuários que podem receber)
- [ ] Submeter
- [ ] Verificar entradas policies_mensagens criadas no banco de dados para usuários permitidos
- [ ] Fazer login como usuário não na whitelist → verificar mensagem NÃO visível em mensagens recebidas
- [ ] Fazer login como usuário na whitelist → verificar mensagem visível em mensagens recebidas

### Teste 4.3: Criar Mensagem com Política Blacklist
- [ ] Criar mensagem com Tipo de Política: **Blacklist**
- [ ] Adicionar usuários bloqueados
- [ ] Submeter
- [ ] Fazer login como usuário bloqueado → verificar mensagem não visível
- [ ] Fazer login como outro usuário → verificar mensagem visível

### Teste 4.4: Receber Mensagem (como Usuário Diferente)
- [ ] Criar e enviar mensagem de Usuário A (Centralizado, Público)
- [ ] Fazer logout de Usuário A
- [ ] Fazer login como Usuário B
- [ ] Navegar para aba "Received" na tela Messages
- [ ] Verificar mensagem de Usuário A aparece na lista
- [ ] Tocar na mensagem para ver conteúdo completo e detalhes

### Teste 4.5: Marcar Mensagem como Lida/Recebida
- [ ] Como Usuário B, tocar botão "Receive" na mensagem
- [ ] Verificar mensagem marcada como entregue
- [ ] Verificar entrega registrada na tabela entregas_mensagens
- [ ] Verificar notificação logada em logs_mensagens

### Teste 4.6: Aba Mensagens Próximas
- [ ] Criar mensagem de Usuário A com localização GPS (ex.: 38.736, -9.143)
- [ ] Fazer login como Usuário B com localização próxima dessa área (dentro do raio)
- [ ] Ir para tela Messages → aba Nearby
- [ ] Verificar mensagem de Usuário A aparece como "próxima"
- [ ] Verificar distância calculada corretamente

---

## Fase 5: Sistema de Mensagens - Modo Descentralizado

### Teste 5.1: Criar Mensagem (Descentralizado)
- [ ] Criar mensagem com Modo de Entrega: **Descentralizado**
- [ ] Adicionar localização Wi-Fi com SSID
- [ ] Submeter
- [ ] Verificar mensagem armazenada com modo_entrega = "Descentralizado"

### Teste 5.2: Recepção de Mensagem P2P (Manual)
- [ ] Com mensagem em modo Descentralizado
- [ ] Navegar para aba Nearby
- [ ] Se outro dispositivo estiver próximo, deve aparecer em mensagens próximas
- [ ] Verificar ação "Receive" funciona e registra entrega
- [ ] Nota: Implementação completa Wi-Fi Direct P2P requer instalação de biblioteca (futuro)

---

## Fase 6: Sistema de Notificações

### Teste 6.1: Visualizar Lista de Notificações
- [ ] Criar e receber múltiplas mensagens como Usuário B
- [ ] Navegar para aba Notifications
- [ ] Verificar lista mostra todas mensagens recebidas/notificações
- [ ] Verificar badge de contagem não lida aparece na aba

### Teste 6.2: Marcar Notificação Única como Lida
- [ ] Na tela Notifications, tocar em item de notificação
- [ ] Verificar mudança visual (fade, checkmark, etc.)
- [ ] Verificar marcado como lido no banco de dados (logs_mensagens.seen != NULL)

### Teste 6.3: Marcar Todas como Lidas
- [ ] Com múltiplas notificações não lidas
- [ ] Tocar botão "Mark All as Read"
- [ ] Verificar todas notificações marcadas como lidas
- [ ] Verificar badge de contagem reseta para 0

### Teste 6.4: Excluir Notificação
- [ ] Tocar ícone delete/trash na notificação
- [ ] Confirmar exclusão no alerta
- [ ] Verificar notificação removida da lista
- [ ] Verificar ainda queryable no backend mas marcado como deletado

---

## Fase 7: Sistema Mule/Relay

### Teste 7.1: Registrar como Mule
- [ ] Navegar para tela Mules
- [ ] Tocar aba "Configuration"
- [ ] Tocar "Register as Mule" ou botão similar
- [ ] Definir capacidade: 20 mensagens
- [ ] Tocar Save
- [ ] Verificar entrada mula criada no banco de dados
- [ ] Verificar capacidade armazenada

### Teste 7.2: Visualizar Atribuições Mule
- [ ] Com Usuário A registrado como mule
- [ ] Criar mensagem de Usuário C direcionada a localização distante
- [ ] Sistema atribui mensagem para mule (Usuário A)
- [ ] Como Usuário A, ir para tela Mules → aba Assignments
- [ ] Verificar tarefa de atribuição listada
- [ ] Verificar atribuição mostra título, localização, prioridade

### Teste 7.3: Aceitar Atribuição Mule
- [ ] Tocar "Accept" na atribuição
- [ ] Confirmar no alerta
- [ ] Verificar atribuição removida da lista
- [ ] Verificar entrega registrada em entregas_mensagens
- [ ] Verificar status mudado em mulas_mensagens para "delivered"

### Teste 7.4: Visualizar Estatísticas Mule
- [ ] Como mule, ir para aba Configuration
- [ ] Verificar cartão de estatísticas mostra:
  - Atribuições totais
  - Contagem entregue
  - Contagem pendente
  - Tempo médio de entrega (se disponível)
- [ ] Verificar estatísticas correspondem a agregados do banco de dados

### Teste 7.5: Atualizar Capacidade Mule
- [ ] Mudar controle deslizante de capacidade para valor diferente
- [ ] Tocar Save
- [ ] Verificar capacidade atualizada no banco de dados
- [ ] Logout e login → verificar persistido

### Teste 7.6: Cancelar Registro como Mule
- [ ] Tocar botão "Remove" na aba Configuration
- [ ] Confirmar no alerta
- [ ] Verificar entrada mula deletada/desativada no banco de dados
- [ ] Verificar não mais atribuições visíveis

---

## Fase 8: Sistema de Fila Offline

### Teste 8.1: Criar Mensagem Quando Offline
- [ ] Habilitar modo avião no dispositivo de teste
- [ ] Navegar para tela Messages
- [ ] Criar nova mensagem (todos campos válidos)
- [ ] Submeter
- [ ] Verificar alerta "Message queued" em vez de "Message created"
- [ ] Verificar AsyncStorage contém mensagem enfileirada
- [ ] Desabilitar modo avião
- [ ] Verificar mensagem automaticamente enviada para backend
- [ ] Verificar notificação "Offline sync" aparece

### Teste 8.2: Criar Localização Quando Offline
- [ ] Habilitar modo avião
- [ ] Ir para tela Locations
- [ ] Adicionar nova localização GPS
- [ ] Tocar Submit
- [ ] Verificar alerta "Location queued"
- [ ] Desabilitar modo avião
- [ ] Verificar localização sincronizada para backend

### Teste 8.3: Lógica de Nova Tentativa de Fila
- [ ] Enfileirar 3-5 mensagens quando offline
- [ ] Voltar online
- [ ] Verificar todas mensagens enfileiradas enviadas em lote
- [ ] Verificar banco de dados mostra todas mensagens criadas
- [ ] Verificar fila limpa do AsyncStorage

### Teste 8.4: Prevenção de Duplicatas
- [ ] Enfileirar mensagem quando offline
- [ ] Voltar online (mensagem sincroniza)
- [ ] Disparar sync manualmente novamente
- [ ] Verificar duplicata não criada no banco de dados

---

## Fase 9: Testes UI/UX

### Teste 9.1: Consistência de Tema
- [ ] Navegar através de todas telas
- [ ] Verificar esquema de cor consistente (laranja #FF6B35, cinzas)
- [ ] Verificar tamanhos de texto legíveis
- [ ] Verificar ícones claros e intuitivos

### Teste 9.2: Navegação
- [ ] Navegação por abas funcionando suavemente
- [ ] Comportamento do botão back consistente
- [ ] Modais abrem/fecham corretamente
- [ ] Sem loops de navegação ou becos sem saída

### Teste 9.3: Validação de Formulário
- [ ] Todos campos de formulário validam antes de submissão
- [ ] Mensagens de erro claras e acionáveis
- [ ] Spinners de loading exibem durante chamadas de API
- [ ] Botões desabilitados durante processamento

### Teste 9.4: Performance de Lista
- [ ] Listas rolam suavemente com muitos itens (100+)
- [ ] Sem lag ou freezing
- [ ] Pull-to-refresh funciona em todas telas de lista

---

## Fase 10: Testes API e Backend

### Teste 10.1: Cabeçalhos de Solicitação API
- [ ] Usar DevTools do navegador ou Charles Proxy para inspecionar solicitações API
- [ ] Verificar cabeçalho Authorization contém token JWT válido
- [ ] Verificar Content-Type é application/json

### Teste 10.2: Respostas de Erro
- [ ] Tentar chamada API com token expirado
- [ ] Verificar resposta 401 e logout de usuário
- [ ] Tentar submissão de dados inválidos
- [ ] Verificar resposta 400 com erros de validação
- [ ] Tentar acesso não autorizado (ex.: deletar mensagem de outro usuário)
- [ ] Verificar resposta 403

### Teste 10.3: Integridade do Banco de Dados
- [ ] Verificar restrições de chave estrangeira (user_id references existem)
- [ ] Verificar não há registros órfãos após exclusão
- [ ] Verificar reversão de transação se erro ocorre durante operações multi-etapa

### Teste 10.4: Limitação de Taxa
- [ ] Submeter solicitações de registro rapidamente
- [ ] Verificar limitação de taxa aciona após limite
- [ ] Verificar resposta 429 (Too Many Requests)

---

## Fase 11: Testes de Segurança

### Teste 11.1: Armazenamento de Senha
- [ ] Hash no banco de dados não deve ser texto simples
- [ ] Tentar fazer login com hash de senha (deve falhar)
- [ ] Verificar bcrypt ou similar usado

### Teste 11.2: Configuração CORS
- [ ] Frontend em http://localhost:19006 deve funcionar
- [ ] Domínio externo solicitando deve ser bloqueado

### Teste 11.3: Segurança de Token
- [ ] Token deve expirar após tempo definido (ex.: 24 horas)
- [ ] Mecanismo de refresh de token (se implementado) deve funcionar
- [ ] Logout deve invalidar token

### Teste 11.4: Injeção SQL
- [ ] Tentar adicionar caracteres SQL no conteúdo da mensagem: `'; DROP TABLE users; --`
- [ ] Verificar mensagem salva como-é, sem execução SQL
- [ ] Backend deve escapar/parametrizar queries

---

## Fase 12: Testes de Performance e Carga

### Teste 12.1: Tempo de Inicialização
- [ ] De inicialização a frio para tela de login: < 3 segundos
- [ ] De login para app principal: < 2 segundos

### Teste 12.2: Tempos de Resposta da API
- [ ] Criação de mensagem: < 1 segundo
- [ ] Carregamento de lista de localização: < 1 segundo
- [ ] Sincronização de notificação: < 500ms

### Teste 12.3: Uso de Memória
- [ ] Monitorar RAM enquanto rola através de listas longas
- [ ] Verificar sem vazamentos de memória (RAM gradualmente aumentando)
- [ ] Verificar memória liberada na navegação

### Teste 12.4: Operações Concorrentes
- [ ] Criar mensagem enquanto carregamento de lista de localização
- [ ] Alternar entre abas rapidamente
- [ ] Sem crashes ou erros

---

## Fase 13: Wi-Fi Direct P2P (Se Implementado)

### Teste 13.1: Detecção de SSID
- [ ] Criar localização Wi-Fi com SSID de AP de teste
- [ ] Verificar SSID aparece em localizações próximas
- [ ] Verificar entrega possível para SSID detectado

### Teste 13.2: Transmissão de Mensagem P2P
- [ ] Enviar mensagem em modo Descentralizado com SSID
- [ ] Conectar segundo dispositivo ao mesmo SSID
- [ ] Verificar mensagem aparece em Nearby para segundo dispositivo
- [ ] Verificar entrega sem envolvimento backend

### Teste 13.3: Teste de Alcance
- [ ] Testar P2P em várias distâncias (10m, 30m, 100m)
- [ ] Verificar conexão cai nos limites de alcance
- [ ] Verificar conexão restabelecida quando em alcance

---

## Fase 14: Testes Específicos de Dispositivo

### Teste 14.1: Testes Android
- [ ] Testar em Android 10, 12, 14 (várias versões)
- [ ] Verificar permissões solicitadas adequadamente (localização, contatos, câmera)
- [ ] Verificar comportamento do botão back
- [ ] Verificar atalhos de teclado de hardware (se houver)

### Teste 14.2: Testes iOS (se aplicável)
- [ ] Testar em iOS 15, 16, 17+
- [ ] Verificar popup de permissões funciona
- [ ] Verificar indicador home não interfere com UI
- [ ] Verificar compatibilidade notch/dynamic island

### Teste 14.3: Variações de Tamanho de Tela
- [ ] Testar em telefone pequeno (5.5")
- [ ] Testar em telefone grande (6.5"+)
- [ ] Testar em tablet (se suportado)
- [ ] Verificar sem corte de texto ou sobreposição

---

## Testes de Regressão (Após Cada Mudança)

- [ ] Todos testes de caminho crítico (Auth → Criar Mensagem → Receber)
- [ ] Todos cenários offline
- [ ] Fluxo de aceitação mule
- [ ] Atualizações de notificação
- [ ] Consistência de navegação

---

## Modelo de Relatório de Bug

Quando bugs são encontrados:

```
**Título**: [Componente] Breve descrição do problema

**Severidade**: Crítico / Alto / Médio / Baixo

**Passos para Reproduzir**:
1. Passo 1
2. Passo 2
3. Passo 3

**Resultado Esperado**:
O que deveria acontecer

**Resultado Atual**:
O que realmente aconteceu

**Ambiente**:
- Dispositivo: [iPhone 14 / Samsung S23 / etc]
- Versão OS: [iOS 17 / Android 14 / etc]
- Versão App: [1.0.0]
- Backend: [Local / Staging / Production]

**Anexos**:
- Screenshot / Vídeo
- Log de erro se disponível
```

---

## Assinatura

- Nome do Testador QA: ___________________
- Data: ___________________
- Resultado Geral: ☐ APROVADO  ☐ REPROVADO
- Problemas Conhecidos: _______________________________
- Recomendações: _______________________________

---

**Duração de Testes**: Estimada 4-6 horas para ciclo completo de QA  
**Última Atualização**: Janeiro 2024
