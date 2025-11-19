const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { validate, profileSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

router.post('/key-value', authenticateToken, validate(profileSchema), profileController.addKeyValue);
router.delete('/key', authenticateToken, profileController.removeKey);
router.get('/my-profile', authenticateToken, profileController.getUserProfile);
router.get('/keys', authenticateToken, profileController.getAllKeys);

module.exports = router;