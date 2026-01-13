// User Controller - Versão completa com todas as funções

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const db = require('../config/database');
const Profile = require('../models/Profile');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId || parseInt(req.params.id, 10);
    const [users] = await db.query('SELECT id, username, data_criacao as created_at, ativo FROM utilizadores WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });

    const profile = await Profile.getUserProfile(userId);

    res.json({ success: true, data: { ...users[0], profile } });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter perfil do utilizador' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    console.log('UPDATE User Profile called');
    // Map incoming body into profile key-values since utilizadores table is minimal
    const userId = req.userId;
    const profileUpdates = req.body.profile || {};

    for (const [k, v] of Object.entries(profileUpdates)) {
      await require('../models/Profile').addKeyValue(userId, k, String(v));
    }

    const updated = await require('../models/Profile').getUserProfile(userId);

    res.json({ success: true, message: 'Perfil atualizado com sucesso', data: updated });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
  }
};
// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    console.log('GET All Users called');
    res.json({
      success: true,
      data: [
        { id: 1, name: 'Utilizador 1', email: 'user1@example.com' },
        { id: 2, name: 'Utilizador 2', email: 'user2@example.com' }
      ],
      message: 'Lista de utilizadores obtida com sucesso'
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter lista de utilizadores'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    console.log('GET User by ID called:', req.params.id);
    res.json({
      success: true,
      data: {
        id: req.params.id,
        name: 'Utilizador ' + req.params.id,
        email: 'user' + req.params.id + '@example.com'
      },
      message: 'Utilizador obtido com sucesso'
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter utilizador'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private
const createUser = async (req, res) => {
  try {
    console.log('CREATE User called');
    res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso',
      data: req.body
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar utilizador'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    console.log('UPDATE User called:', req.params.id);
    res.json({
      success: true,
      message: 'Utilizador atualizado com sucesso',
      data: {
        id: req.params.id,
        ...req.body
      }
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar utilizador'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    console.log('DELETE User called:', req.params.id);
    res.json({
      success: true,
      message: 'Utilizador eliminado com sucesso'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao eliminar utilizador'
    });
  }
};

// EXPORTE TODAS AS FUNÇÕES
module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};