const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, sendMessage);

router.route('/conversations')
  .get(protect, getConversations);

router.route('/read')
  .put(protect, markAsRead);

router.route('/conversation/:userId/:locationId')
  .get(protect, getConversation);

module.exports = router;