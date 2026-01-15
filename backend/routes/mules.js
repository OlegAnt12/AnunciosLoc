const express = require('express');
const router = express.Router();
const muleController = require('../controllers/muleController');
const { protect } = require('../middleware/auth');

// GET /api/mules/assignments - list assignments for authenticated mule
router.get('/assignments', protect, muleController.listAssignments);

// POST /api/mules/assignments/:id/accept - accept an assignment
router.post('/assignments/:id/accept', protect, muleController.acceptAssignment);

// GET /api/mules/config - get current user mule configuration
router.get('/config', protect, muleController.getConfig);

// POST /api/mules/config - create or update mule configuration
router.post('/config', protect, muleController.upsertConfig);

// DELETE /api/mules/config - remove mule configuration
router.delete('/config', protect, muleController.removeConfig);

module.exports = router;