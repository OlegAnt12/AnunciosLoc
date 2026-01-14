const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.get('/count', protect, notificationController.getUnreadCount);
router.post('/', protect, notificationController.createNotification);
// Mark all as read
router.put('/read', protect, notificationController.markAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;