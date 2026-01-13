const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect } = require('../middleware/auth');

router.post('/', protect, deviceController.registerDevice);
router.get('/', protect, deviceController.getUserDevices);
router.post('/:id/connectivity', protect, deviceController.updateConnectivity);
router.delete('/:id', protect, deviceController.unregisterDevice);


module.exports = router;