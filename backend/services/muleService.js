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

      // Log the action in logs_mensagens
      await connection.execute(
        'INSERT INTO logs_mensagens (mensagem_id, acao, utilizador_id, detalhes) VALUES (?, ?, ?, ?)',
        [assignment.mensagem_id, 'RETRANSMITIDA', mulaUserId, `Mensagem retransmitida pela mula ${mulaUserId}`]
      );

      return { assignmentId: assignmentId, mensagemId: assignment.mensagem_id };
    });
  }
}

module.exports = new MuleService();