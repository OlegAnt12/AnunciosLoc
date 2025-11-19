const db = require('../config/database');

const statsController = {
  getSystemStats: async (req, res) => {
    try {
      const [stats] = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM utilizadores WHERE ativo = TRUE) as total_utilizadores,
          (SELECT COUNT(*) FROM locais WHERE ativo = TRUE) as total_locais,
          (SELECT COUNT(*) FROM mensagens WHERE ativa = TRUE AND removida = FALSE) as total_mensagens,
          (SELECT COUNT(*) FROM entregas_mensagens WHERE recebida = TRUE) as total_entregas,
          (SELECT COUNT(*) FROM sessoes WHERE ativa = TRUE) as sessoes_ativas
      `);

      const [recentActivity] = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM mensagens WHERE data_publicacao >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as mensagens_24h,
          (SELECT COUNT(*) FROM entregas_mensagens WHERE data_rececao >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as entregas_24h,
          (SELECT COUNT(*) FROM utilizadores WHERE data_criacao >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as novos_utilizadores_7d
      `);

      res.json({
        success: true,
        data: {
          ...stats[0],
          ...recentActivity[0]
        }
      });
    } catch (error) {
      console.error('Erro a obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  getUserStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const [userStats] = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM mensagens WHERE autor_id = ? AND removida = FALSE) as mensagens_partilhadas,
          (SELECT COUNT(*) FROM entregas_mensagens WHERE utilizador_id = ? AND recebida = TRUE) as mensagens_recebidas,
          (SELECT COUNT(*) FROM locais WHERE criador_id = ? AND ativo = TRUE) as locais_criados,
          (SELECT COUNT(DISTINCT local_id) FROM matching_localizacao WHERE utilizador_id = ?) as locais_visitados
      `, [userId, userId, userId, userId]);

      const [recentStats] = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM mensagens WHERE autor_id = ? AND data_publicacao >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as mensagens_7d,
          (SELECT COUNT(*) FROM entregas_mensagens WHERE utilizador_id = ? AND data_rececao >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as rececoes_7d
      `, [userId, userId]);

      res.json({
        success: true,
        data: {
          ...userStats[0],
          ...recentStats[0]
        }
      });
    } catch (error) {
      console.error('Erro a obter estatísticas do utilizador:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  },

  getLocationStats: async (req, res) => {
    try {
      const { locationId } = req.params;

      const [stats] = await db.query(`
        SELECT 
          l.id,
          l.nome,
          COUNT(DISTINCT m.id) as total_mensagens,
          COUNT(DISTINCT CASE WHEN m.ativa = TRUE AND m.removida = FALSE THEN m.id END) as mensagens_ativas,
          COUNT(DISTINCT em.id) as total_entregas,
          COUNT(DISTINCT em.utilizador_id) as utilizadores_unicos,
          COUNT(DISTINCT ml.utilizador_id) as visitantes_unicos
        FROM locais l
        LEFT JOIN mensagens m ON l.id = m.local_id
        LEFT JOIN entregas_mensagens em ON m.id = em.mensagem_id
        LEFT JOIN matching_localizacao ml ON l.id = ml.local_id
        WHERE l.id = ?
        GROUP BY l.id, l.nome
      `, [locationId]);

      if (stats.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Local não encontrado'
        });
      }

      res.json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      console.error('Erro a obter estatísticas do local:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = statsController;