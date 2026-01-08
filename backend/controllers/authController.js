const { generateToken } = require('../utils/auth');

const register = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: 1,
        name: req.body.name,
        email: req.body.email,
        token: generateToken(1)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: 1,
        name: 'Test User',
        email: req.body.email,
        token: generateToken(1)
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
};

const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: generateToken(1)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken
};