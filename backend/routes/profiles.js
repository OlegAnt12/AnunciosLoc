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

module.exports = router;