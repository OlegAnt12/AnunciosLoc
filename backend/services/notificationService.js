const db = require('../config/database');

class NotificationService {
  async notifyNewMessage(messageId, locationId) {
    try {
      // Encontrar utilizadores que estão atualmente no local
      const [usersInLocation] = await db.query(`
        SELECT DISTINCT lu.utilizador_id
        FROM localizacoes_utilizador lu
        WHERE lu.data_registo >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        AND lu.utilizador_id IN (
          SELECT utilizador_id FROM matching_localizacao 
          WHERE local_id = ? AND data_matching >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
        )
      `, [locationId]);

      // Em produção, aqui enviaríamos push notifications
      // Para a versão intermédia, apenas registamos no log
      
      for (const user of usersInLocation) {
        await db.query(
          'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
          [messageId, 'NOTIFICACAO', user.utilizador_id, 'Notificação de nova mensagem']
        );
      }

      console.log(`🔔 Notificações enviadas para ${usersInLocation.length} utilizadores no local ${locationId}`);
      
      return usersInLocation.length;
    } catch (error) {
      console.error('Erro a enviar notificações:', error);
      return 0;
    }
  }

  async getUserNotifications(userId, limit = 50) {
    const notifications = await db.query(`
      SELECT 
        lm.id,
        lm.mensagem_id,
        lm.acao,
        lm.detalhes,
        lm.data_log as timestamp,
        m.titulo as mensagem_titulo,
        l.nome as local_nome
      FROM logs_mensagens lm
      LEFT JOIN mensagens m ON lm.mensagem_id = m.id
      LEFT JOIN locais l ON m.local_id = l.id
      WHERE lm.utilizador_id = ? 
        AND lm.acao IN ('NOTIFICACAO', 'RECEBIDA', 'CRIADA')
        AND lm.data_log >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY lm.data_log DESC
      LIMIT ?
    `, [userId, limit]);

    return notifications;
  }

  async getUnreadNotificationCount(userId) {
    const [result] = await db.query(`
      SELECT COUNT(*) as count
      FROM logs_mensagens 
      WHERE utilizador_id = ? 
        AND acao = 'NOTIFICACAO'
        AND data_log >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND id > COALESCE(
          (SELECT ultima_notificacao_lida FROM utilizadores WHERE id = ?), 
          0
        )
    `, [userId, userId]);

    return result[0].count;
  }

  async markNotificationsAsRead(userId, lastId = null) {
    if (lastId) {
      await db.query(
        'UPDATE utilizadores SET ultima_notificacao_lida = ? WHERE id = ?',
        [lastId, userId]
      );
    } else {
      await db.query(
        'UPDATE utilizadores SET ultima_notificacao_lida = (SELECT COALESCE(MAX(id), 0) FROM logs_mensagens WHERE utilizador_id = ?) WHERE id = ?',
        [userId, userId]
      );
    }
  }

  async deleteNotification(userId, id) {
    // Only allow deletion if the notification belongs to the user
    const [rows] = await db.query('SELECT id FROM logs_mensagens WHERE id = ? AND utilizador_id = ?', [id, userId]);
    if (!rows || rows.length === 0) {
      throw new Error('Notificação não encontrada ou sem permissão');
    }

    await db.query('DELETE FROM logs_mensagens WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new NotificationService();