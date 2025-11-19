const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
const getLocations = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    location
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const locations = await Location.find(query)
    .populate('user', 'name phone')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Location.countDocuments(query);

  res.json({
    locations,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count
  });
});

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Public
const getLocationById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id)
    .populate('user', 'name phone email');

  if (location && location.isActive) {
    // Increment views
    location.views += 1;
    await location.save();
    
    res.json(location);
  } else {
    res.status(404);
    throw new Error('Location not found');
  }
});

// @desc    Create location
// @route   POST /api/locations
// @access  Private
const createLocation = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    category,
    location,
    latitude,
    longitude,
    images
  } = req.body;

  const newLocation = await Location.create({
    title,
    description,
    price,
    category,
    location,
    latitude,
    longitude,
    images,
    user: req.user._id
  });

  const populatedLocation = await Location.findById(newLocation._id)
    .populate('user', 'name phone');

  res.status(201).json(populatedLocation);
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private
const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  if (location.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this location');
  }

  const updatedLocation = await Location.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name phone');

  res.json(updatedLocation);
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private
const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  if (location.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this location');
  }

  await Location.findByIdAndDelete(req.params.id);
  res.json({ message: 'Location removed' });
});

// @desc    Get user locations
// @route   GET /api/locations/user/my-locations
// @access  Private
const getUserLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  
  res.json(locations);
});

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getUserLocations,
};