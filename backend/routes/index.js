const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const locationRoutes = require('./locations');
const profileRoutes = require('./profiles');
const messageRoutes = require('./messages');
const notificationRoutes = require('./notifications');
const statsRoutes = require('./stats');
const userRoutes = require('./users');
const deviceRoutes = require('./devices');
const muleRoutes = require('./mules');

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/profiles', profileRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stats', statsRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/mules', muleRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AnunciosLoc API está funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;