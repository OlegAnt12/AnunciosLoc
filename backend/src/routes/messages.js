const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validate, messageSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, validate(messageSchema), messageController.createMessage);
router.post('/available', authenticateToken, messageController.getAvailableMessages);
router.post('/receive', authenticateToken, messageController.receiveMessage);
router.get('/my-messages', authenticateToken, messageController.getUserMessages);
router.get('/sent-messages', authenticateToken, messageController.getSentMessages);
router.delete('/:messageId', authenticateToken, messageController.deleteMessage);
router.get('/:messageId/details', authenticateToken, messageController.getMessageDetails);

module.exports = router;