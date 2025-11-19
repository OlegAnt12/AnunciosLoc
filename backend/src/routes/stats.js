const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getPlatformStats,
  getUserStats,
  getLocationStats,
  getMessageStats
} = require('../controllers/statsController');

router.get('/platform', protect, admin, getPlatformStats);
router.get('/user', protect, getUserStats);
router.get('/locations', protect, admin, getLocationStats);
router.get('/messages', protect, admin, getMessageStats);

module.exports = router;