const db = require('../config/database');

const userController = {
  // Obter perfil do utilizador
  getProfile: async (req, res) => {
    try {
      const userResult = await db.query(
        'SELECT id, username, data_criacao FROM utilizadores WHERE id = $1',
        [req.user.id]
      );

      const profileResult = await db.query(
        'SELECT chave, valor FROM perfis_utilizador WHERE utilizador_id = $1',
        [req.user.id]
      );

      res.json({
        user: userResult.rows[0],
        profile: profileResult.rows
      });
    } catch (error) {
      console.error('Erro a obter perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar perfil (apenas username por agora)
  updateProfile: async (req, res) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username é obrigatório' });
    }

    try {
      // Verificar se username já existe noutro utilizador
      const userExists = await db.query(
        'SELECT id FROM utilizadores WHERE username = $1 AND id != $2',
        [username, req.user.id]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'Nome de utilizador já existe' });
      }

      await db.query(
        'UPDATE utilizadores SET username = $1 WHERE id = $2',
        [username, req.user.id]
      );

      res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      console.error('Erro a atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Obter chaves de perfil disponíveis
  getProfileKeys: async (req, res) => {
    try {
      const result = await db.query(
        'SELECT chave, descricao FROM chaves_perfil_publicas ORDER BY chave'
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Erro a obter chaves:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Adicionar chave-valor ao perfil
  addProfileKey: async (req, res) => {
    const { chave, valor } = req.body;

    if (!chave || !valor) {
      return res.status(400).json({ error: 'Chave e valor são obrigatórios' });
    }

    try {
      await db.query(
        `INSERT INTO perfis_utilizador (utilizador_id, chave, valor) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (utilizador_id, chave) 
         DO UPDATE SET valor = $3`,
        [req.user.id, chave, valor]
      );

      // Adicionar à lista pública de chaves se não existir
      await db.query(
        `INSERT INTO chaves_perfil_publicas (chave) 
         VALUES ($1) 
         ON CONFLICT (chave) DO NOTHING`,
        [chave]
      );

      res.json({ message: 'Chave adicionada ao perfil com sucesso' });
    } catch (error) {
      console.error('Erro a adicionar chave:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Remover chave do perfil
  removeProfileKey: async (req, res) => {
    const { key } = req.params;

    try {
      await db.query(
        'DELETE FROM perfis_utilizador WHERE utilizador_id = $1 AND chave = $2',
        [req.user.id, key]
      );

      res.json({ message: 'Chave removida do perfil com sucesso' });
    } catch (error) {
      console.error('Erro a remover chave:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = userController;