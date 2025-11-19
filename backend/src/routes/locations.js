const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getUserLocations
} = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getLocations)
  .post(protect, createLocation);

router.route('/user/my-locations')
  .get(protect, getUserLocations);

router.route('/:id')
  .get(getLocationById)
  .put(protect, updateLocation)
  .delete(protect, deleteLocation);

module.exports = router;