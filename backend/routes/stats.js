const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, statsController.getStats);

module.exports = router;