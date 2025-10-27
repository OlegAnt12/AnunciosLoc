const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas as routes protegidas
router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/profile/keys', userController.getProfileKeys);
router.post('/profile/keys', userController.addProfileKey);
router.delete('/profile/keys/:key', userController.removeProfileKey);

module.exports = router;