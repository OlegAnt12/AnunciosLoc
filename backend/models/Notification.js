const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'info'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  related_entity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  related_entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = { Notification };