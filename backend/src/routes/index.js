const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const locationRoutes = require('./locations');
const profileRoutes = require('./profiles');
const messageRoutes = require('./messages');

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/profiles', profileRoutes);
router.use('/messages', messageRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AnunciosLoc API está funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;