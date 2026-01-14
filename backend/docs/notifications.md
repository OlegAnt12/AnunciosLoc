# Notificações API

Endpoints relacionados a notificações do sistema.

- GET /api/notifications
  - Descrição: Lista as notificações do utilizador autenticado (últimos 7 dias por padrão).
  - Autenticação: Obrigatória (Bearer token)
  - Resposta: { success: true, data: [ { id, mensagem_id, acao, detalhes, timestamp, mensagem_titulo, local_nome } ] }

- GET /api/notifications/count
  - Descrição: Retorna a contagem de notificações não-lidas nas últimas 24h (com base em `ultima_notificacao_lida` do utilizador).
  - Autenticação: Obrigatória
  - Resposta: { success: true, data: { count: number } }

- PUT /api/notifications/read
  - Descrição: Marca todas as notificações como lidas (atualiza `ultima_notificacao_lida` para o maior id existente).
  - Autenticação: Obrigatória
  - Resposta: { success: true, message: 'Notificações marcadas como lidas' }

- PUT /api/notifications/:id/read
  - Descrição: Marca até a notificação especificada como lida (define `ultima_notificacao_lida` para o ID fornecido).
  - Autenticação: Obrigatória
  - Parâmetros: id (path)
  - Resposta: { success: true, message: 'Notificações marcadas como lidas' }

- POST /api/notifications
  - Descrição: Cria uma notificação manualmente (uso administrativo ou testes).
  - Autenticação: Obrigatória
  - Body: { user_id: number, mensagem_id: number, acao?: string, detalhes?: string }
  - Resposta: { success: true, message: 'Notificação criada' }

- DELETE /api/notifications/:id
  - Descrição: Remove a notificação (apenas se pertencer ao utilizador autenticado).
  - Autenticação: Obrigatória
  - Parâmetros: id (path)
  - Resposta: { success: true, message: 'Notificação removida' }

Observação: Atualmente a "entrega" de notificações push apenas regista entradas em `logs_mensagens` (ver `NotificationService.notifyNewMessage`) — futuramente poderá ser integrada com um serviço de push.
