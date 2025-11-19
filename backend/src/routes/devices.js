const express = require('express');
const router = express.Router();
const {
  registerDevice,
  unregisterDevice,
  getUserDevices
} = require('../controllers/deviceController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getUserDevices)
  .post(protect, registerDevice);

router.route('/:id')
  .delete(protect, unregisterDevice);

module.exports = router;