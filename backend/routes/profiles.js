const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// @desc    Obter perfil do utilizador
// @route   GET /api/profiles/me
// @access  Private
router.get('/me', protect, profileController.getProfile);

// @desc    Atualizar perfil do utilizador
// @route   PUT /api/profiles/me
// @access  Private
router.put('/me', protect, profileController.updateProfile);

// @desc    Eliminar perfil do utilizador
// @route   DELETE /api/profiles/me
// @access  Private
router.delete('/me', protect, profileController.deleteProfile);

// @desc    Adicionar/Atualizar uma chave de perfil para o utilizador autenticado
// @route   POST /api/profiles/key
// @access  Private
router.post('/key', protect, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Chave é obrigatória' });
    await require('../models/Profile').addKeyValue(req.userId, key, String(value));
    res.json({ success: true, message: 'Chave adicionada/atualizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao adicionar chave' });
  }
});

// @desc    Remover uma chave de perfil para o utilizador autenticado
// @route   DELETE /api/profiles/key
// @access  Private
router.delete('/key', protect, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Chave é obrigatória' });
    await require('../models/Profile').removeKey(req.userId, key);
    res.json({ success: true, message: 'Chave removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover chave' });
  }
});

// @desc    Registrar token de push notification
// @route   POST /api/profiles/push-token
// @access  Private
router.post('/push-token', protect, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) return res.status(400).json({ success: false, message: 'Push token é obrigatório' });

    const db = require('../config/database');
    await db.query('UPDATE utilizadores SET push_token = ? WHERE id = ?', [pushToken, req.userId]);
    res.json({ success: true, message: 'Push token registrado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao registrar push token' });
  }
});