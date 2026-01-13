const db = require('../config/database');

class Message {
  static async create({ titulo, conteudo, local_id, autor_id, tipo_politica_id, modo_entrega, data_inicio, data_fim }) {
    const [result] = await db.execute(
      `INSERT INTO mensagens (titulo, conteudo, autor_id, local_id, tipo_politica_id, modo_entrega, data_inicio, data_fim) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, conteudo, autor_id, local_id, tipo_politica_id, modo_entrega, data_inicio, data_fim]
    );

    return result.insertId;
  }

  static async addPolicyRules(mensagemId, regras) {
    if (!regras || regras.length === 0) return;

    const values = regras.map(r => [mensagemId, r.chave, r.valor]);
    const placeholders = regras.map(() => '(?, ?, ?)').join(', ');

    await db.execute(
      `INSERT INTO restricoes_mensagem (mensagem_id, chave, valor) VALUES ${placeholders}`,
      values.flat()
    );
  }

  static async getMessagesForUser(utilizadorId, localId) {
    if (!localId) return [];

    // Use stored procedure obter_mensagens_disponiveis
    const [rows] = await db.query('CALL obter_mensagens_disponiveis(?, ?)', [utilizadorId, localId]);
    // MySQL CALL returns results in an array; the first item is the rows
    return rows[0] || [];
  }

  static async markAsReceived(utilizadorId, mensagemId, dispositivo_origem = null, modo_entrega = 'CENTRALIZADO') {
    const [result] = await db.execute(
      `INSERT INTO entregas_mensagens (mensagem_id, utilizador_id, dispositivo_origem, modo_entrega, recebida, data_rececao) VALUES (?, ?, ?, ?, TRUE, NOW())`,
      [mensagemId, utilizadorId, dispositivo_origem, modo_entrega]
    );

    return result.insertId;
  }

  static async getUserMessages(utilizadorId) {
    const [rows] = await db.query(`
      SELECT m.*, u.username as autor_username, l.nome as local_nome, em.data_rececao as data_rececao
      FROM entregas_mensagens em
      JOIN mensagens m ON em.mensagem_id = m.id
      JOIN utilizadores u ON m.autor_id = u.id
      JOIN locais l ON m.local_id = l.id
      WHERE em.utilizador_id = ? AND em.recebida = TRUE
      ORDER BY em.data_rececao DESC
    `, [utilizadorId]);

    return rows;
  }

  static async getUserSentMessages(utilizadorId, limit = 20, offset = 0) {
    const [rows] = await db.query(`
      SELECT m.*, l.nome as local_nome, COUNT(DISTINCT em.id) as total_entregas
      FROM mensagens m
      JOIN locais l ON m.local_id = l.id
      LEFT JOIN entregas_mensagens em ON m.id = em.mensagem_id AND em.recebida = TRUE
      WHERE m.autor_id = ? AND m.removida = FALSE
      GROUP BY m.id
      ORDER BY m.data_publicacao DESC
      LIMIT ? OFFSET ?
    `, [utilizadorId, parseInt(limit, 10), parseInt(offset, 10)]);

    return rows;
  }

  static async deleteMessage(mensagemId, autorId) {
    const [result] = await db.execute(
      'UPDATE mensagens SET removida = TRUE WHERE id = ? AND autor_id = ?',
      [mensagemId, autorId]
    );

    return result.affectedRows > 0;
  }

  static async getMessagePolicyRules(mensagemId) {
    const [rows] = await db.execute(
      'SELECT chave as `key`, valor as `value` FROM restricoes_mensagem WHERE mensagem_id = ?',
      [mensagemId]
    );

    return rows;
  }
}

module.exports = Message;