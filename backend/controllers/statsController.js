const db = require('../config/database');

const statsController = {
  async getStats(req, res) {
    try {
      const [[u]] = await db.query('SELECT COUNT(*) as total FROM utilizadores');
      const [[l]] = await db.query('SELECT COUNT(*) as total FROM locais');
      const [[m]] = await db.query('SELECT COUNT(*) as total FROM mensagens');
      const [[n]] = await db.query('SELECT COUNT(*) as total FROM logs_mensagens');
      const [[d]] = await db.query('SELECT COUNT(*) as total FROM chaves_publicas');

      res.json({
        success: true,
        data: {
          users: u.total,
          locations: l.total,
          messages: m.total,
          messageLogs: n.total,
          publicKeys: d.total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter estatísticas' });
    }
  }
};

module.exports = statsController;