const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota de teste SEM middleware
router.get('/profile', userController.getUserProfile);

// Comente todas as outras rotas temporariamente
router.put('/profile', userController.updateUserProfile);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;