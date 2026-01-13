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
    const [rows] = await db.query('SELECT id, username, data_criacao as created_at, ativo FROM utilizadores ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter lista de utilizadores' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await db.query('SELECT id, username, data_criacao as created_at, ativo FROM utilizadores WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    const profile = await Profile.getUserProfile(id);
    res.json({ success: true, data: { ...rows[0], profile } });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter utilizador' });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private
const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'username e password obrigatórios' });

    const authService = require('../services/authService');
    const user = await authService.registerUser(username, password);

    res.status(201).json({ success: true, message: 'Utilizador criado com sucesso', data: user });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(400).json({ success: false, message: error.message || 'Erro ao criar utilizador' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { username, ativo } = req.body;

    const updates = [];
    const params = [];

    if (username) { updates.push('username = ?'); params.push(username); }
    if (typeof ativo !== 'undefined') { updates.push('ativo = ?'); params.push(ativo ? 1 : 0); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar' });

    params.push(id);
    await db.query(`UPDATE utilizadores SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Utilizador atualizado com sucesso' });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar utilizador' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('UPDATE utilizadores SET ativo = FALSE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Utilizador desativado com sucesso' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ success: false, message: 'Erro ao eliminar utilizador' });
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