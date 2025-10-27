const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/location/:localId', messageController.getAvailableMessages);
router.post('/', messageController.createMessage);
router.post('/:messageId/receive', messageController.receiveMessage);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;