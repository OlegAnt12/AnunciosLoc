const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.get('/count', protect, notificationController.getUnreadCount);
router.post('/', protect, notificationController.createNotification);
router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;