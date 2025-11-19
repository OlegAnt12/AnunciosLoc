const Device = require('../models/Device');
const asyncHandler = require('express-async-handler');

// @desc    Register device for push notifications
// @route   POST /api/devices
// @access  Private
const registerDevice = asyncHandler(async (req, res) => {
  const { token, platform, deviceId } = req.body;

  // Check if device already exists
  const existingDevice = await Device.findOne({ deviceId, user: req.user._id });

  if (existingDevice) {
    // Update existing device token
    existingDevice.token = token;
    existingDevice.platform = platform;
    await existingDevice.save();
    res.json(existingDevice);
  } else {
    // Create new device
    const device = await Device.create({
      user: req.user._id,
      token,
      platform,
      deviceId
    });
    res.status(201).json(device);
  }
});

// @desc    Unregister device
// @route   DELETE /api/devices/:id
// @access  Private
const unregisterDevice = asyncHandler(async (req, res) => {
  const device = await Device.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!device) {
    res.status(404);
    throw new Error('Device not found');
  }

  await Device.findByIdAndDelete(req.params.id);
  res.json({ message: 'Device unregistered' });
});

// @desc    Get user devices
// @route   GET /api/devices
// @access  Private
const getUserDevices = asyncHandler(async (req, res) => {
  const devices = await Device.find({ user: req.user._id });
  res.json(devices);
});

module.exports = {
  registerDevice,
  unregisterDevice,
  getUserDevices,
};