const express = require('express');
const locationController = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', locationController.listLocations);
router.post('/', locationController.createLocation);
router.delete('/:id', locationController.deleteLocation);
router.post('/check-location', locationController.checkCurrentLocation);

module.exports = router;