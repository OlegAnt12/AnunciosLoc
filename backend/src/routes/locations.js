const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { validate, locationSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, validate(locationSchema), locationController.createLocation);
router.get('/', authenticateToken, locationController.getAllLocations);
router.get('/:id', authenticateToken, locationController.getLocation);
router.delete('/:id', authenticateToken, locationController.deleteLocation);
router.post('/nearby', authenticateToken, locationController.findNearbyLocations);

module.exports = router;