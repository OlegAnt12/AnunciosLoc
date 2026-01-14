const express = require('express');
const router = express.Router();
const muleController = require('../controllers/muleController');
const { protect } = require('../middleware/auth');

// GET /api/mules/assignments - list assignments for authenticated mule
router.get('/assignments', protect, muleController.listAssignments);

// POST /api/mules/assignments/:id/accept - accept an assignment
router.post('/assignments/:id/accept', protect, muleController.acceptAssignment);

module.exports = router;