const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

// @desc    Criar localização
// @route   POST /api/locations
// @access  Private
router.post('/', protect, locationController.createLocation);

// @desc    Obter todas as localizações
// @route   GET /api/locations
// @access  Private
router.get('/', protect, locationController.getAllLocations);

// @desc    Obter localização por ID
// @route   GET /api/locations/:id
// @access  Private
router.get('/:id', protect, locationController.getLocation);

// @desc    Atualizar localização
// @route   PUT /api/locations/:id
// @access  Private
router.put('/:id', protect, locationController.updateLocation);

// @desc    Eliminar localização
// @route   DELETE /api/locations/:id
// @access  Private
router.delete('/:id', protect, locationController.deleteLocation);

// @desc    Encontrar localizações próximas
// @route   POST /api/locations/nearby
// @access  Private
router.post('/nearby', protect, locationController.findNearbyLocations);

module.exports = router;