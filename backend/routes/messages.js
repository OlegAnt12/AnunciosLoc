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

// @desc    Atualizar mensagem
// @route   PUT /api/messages/:id
// @access  Private
router.put('/:id', protect, messageController.updateMessage);

// @desc    Eliminar mensagem
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, messageController.deleteMessage);

module.exports = router;