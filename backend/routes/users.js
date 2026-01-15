const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Profile = require('../models/Profile');

// Rota de perfil do utilizador autenticado (proteção adicionada)
router.get('/profile', require('../middleware/auth').protect, userController.getUserProfile);


// Obter perfil público de um utilizador
router.get('/:id/profile', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const profile = await Profile.getUserProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao obter perfil do utilizador' });
  }
});

// Mensagens recebidas por um utilizador (público ou privado conforme permissão)
router.get('/:id/messages', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const messageService = require('../services/messageService');
    const result = await messageService.getReceivedMessages(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter mensagens do utilizador' });
  }
});

// Mensagens enviadas por um utilizador
router.get('/:id/sent-messages', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const messageService = require('../services/messageService');
    const result = await messageService.getMyMessages(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter mensagens enviadas' });
  }
});

// Localizações criadas por um utilizador
router.get('/:id/locations', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const locationService = require('../services/locationService');
    const locations = await locationService.getLocations({ criador_id: userId });
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter localizações do utilizador' });
  }
});

// Protected user management routes
router.put('/profile', require('../middleware/auth').protect, userController.updateUserProfile);
router.get('/', require('../middleware/auth').protect, userController.getAllUsers);
router.get('/:id', require('../middleware/auth').protect, userController.getUserById);
router.post('/', require('../middleware/auth').protect, userController.createUser);
router.put('/:id', require('../middleware/auth').protect, userController.updateUser);
router.delete('/:id', require('../middleware/auth').protect, userController.deleteUser);

module.exports = router;