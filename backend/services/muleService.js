const db = require('../config/database');

class MuleService {
  // List assignments for a mule (un-delivered)
  async getAssignmentsForMule(mulaUserId) {
    const [rows] = await db.query(
      `SELECT mm.id as assignment_id, mm.mensagem_id, mm.publicador_utilizador_id, mm.prioridade, mm.data_atribuicao, mm.entregue,
              m.titulo, m.conteudo, l.nome as local_nome, u.username as publisher_username
       FROM mulas_mensagens mm
       JOIN mensagens m ON mm.mensagem_id = m.id
       JOIN locais l ON m.local_id = l.id
       JOIN utilizadores u ON mm.publicador_utilizador_id = u.id
       WHERE mm.mula_utilizador_id = ? AND mm.entregue = FALSE
       ORDER BY mm.prioridade DESC, mm.data_atribuicao ASC`,
      [mulaUserId]
    );

    return rows;
  }

  // Accept an assignment (mark as delivered by mule)
  async acceptAssignment(assignmentId, mulaUserId) {
    return await db.transaction(async (connection) => {
      const [rows] = await connection.execute(
        'SELECT * FROM mulas_mensagens WHERE id = ? AND mula_utilizador_id = ? FOR UPDATE',
        [assignmentId, mulaUserId]
      );

      if (rows.length === 0) {
        throw new Error('Atribuição não encontrada para esta mula');
      }

      const assignment = rows[0];
      if (assignment.entregue) {
        throw new Error('Atribuição já foi entregue');
      }

      // Mark as delivered by the mule
      await connection.execute(
        'UPDATE mulas_mensagens SET entregue = TRUE, data_entrega = NOW() WHERE id = ?',
        [assignmentId]
      );

      // Ensure we don't double-insert a delivery record for this mule & message
      const [existing] = await connection.execute(
        'SELECT id FROM entregas_mensagens WHERE mensagem_id = ? AND utilizador_id = ? AND recebida = TRUE',
        [assignment.mensagem_id, mulaUserId]
      );

      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO entregas_mensagens
           (mensagem_id, utilizador_id, dispositivo_origem, modo_entrega, recebida, data_rececao)
           VALUES (?, ?, ?, ?, TRUE, NOW())`,
          [assignment.mensagem_id, mulaUserId, 'MULA', 'DESCENTRALIZADO']
        );
      }

      // Log the action in logs_mensagens
      await connection.execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [assignment.mensagem_id, 'RETRANSMITIDA', mulaUserId, `Mensagem retransmitida pela mula ${mulaUserId}`]
      );

      return { assignmentId: assignmentId, mensagemId: assignment.mensagem_id };
    });
  }

  // Get or create/update mule config
  async getConfigForUser(mulaUserId) {
    const [rows] = await db.execute('SELECT utilizador_id as user_id, espaco_maximo_mensagens as capacity, ativo FROM config_mulas WHERE utilizador_id = ?', [mulaUserId]);
    return rows[0] || null;
  }

  async upsertConfig(mulaUserId, capacity = 10, active = true) {
    const [existing] = await db.execute('SELECT id FROM config_mulas WHERE utilizador_id = ?', [mulaUserId]);
    if (existing.length === 0) {
      const [result] = await db.execute('INSERT INTO config_mulas (utilizador_id, espaco_maximo_mensagens, ativo) VALUES (?, ?, ?)', [mulaUserId, capacity, active]);
      return { id: result.insertId, utilizador_id: mulaUserId, capacity, active };
    } else {
      await db.execute('UPDATE config_mulas SET espaco_maximo_mensagens = ?, ativo = ? WHERE utilizador_id = ?', [capacity, active, mulaUserId]);
      return { id: existing[0].id, utilizador_id: mulaUserId, capacity, active };
    }
  }

  async removeConfig(mulaUserId) {
    const [result] = await db.execute('DELETE FROM config_mulas WHERE utilizador_id = ?', [mulaUserId]);
    return result.affectedRows > 0;
  }

  // Get mule statistics
  async getMuleStats(mulaUserId) {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) as total_assignments,
        SUM(CASE WHEN entregue = TRUE THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN entregue = FALSE THEN 1 ELSE 0 END) as pending,
        AVG(TIMESTAMPDIFF(MINUTE, data_atribuicao, data_entrega)) as avg_delivery_time_minutes
      FROM mulas_mensagens
      WHERE mula_utilizador_id = ?
    `, [mulaUserId]);

    return rows[0] || { total_assignments: 0, delivered: 0, pending: 0, avg_delivery_time_minutes: null };
  }
}

module.exports = new MuleService();