const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;