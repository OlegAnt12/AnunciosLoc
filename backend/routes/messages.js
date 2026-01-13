const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// @desc    Enviar mensagem
// @route   POST /api/messages
// @access  Private
router.post('/', protect, messageController.createMessage);

// @desc    Obter todas as mensagens do utilizador
// @route   GET /api/messages
// @access  Private
router.get('/', protect, messageController.getUserMessages);

// @desc    Obter mensagem por ID
// @route   GET /api/messages/:id
// @access  Private
router.get('/:id', protect, messageController.getMessage);

// @desc    Receber / marcar como recebida uma mensagem
// @route   POST /api/messages/:id/receive
// @access  Private
router.post('/:id/receive', protect, messageController.receiveMessage);

// @desc    Atualizar mensagem
// @route   PUT /api/messages/:id
// @access  Private
router.put('/:id', protect, messageController.updateMessage);

// @desc    Eliminar mensagem
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, messageController.deleteMessage);

// @desc    Obter mensagens enviadas pelo utilizador autenticado
// @route   GET /api/messages/sent
// @access  Private
router.get('/sent', protect, messageController.getMyMessages);

// @desc    Obter mensagens próximas baseado em localização (GPS/WIFI)
// @route   POST /api/messages/nearby
// @access  Private
router.post('/nearby', protect, messageController.nearby);

module.exports = router;