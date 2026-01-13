const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilizador_id: { type: DataTypes.INTEGER, allowNull: false },
  device_id: { type: DataTypes.STRING, allowNull: false },
  device_name: { type: DataTypes.STRING, allowNull: true },
  tipo: { type: DataTypes.STRING, allowNull: true },
  so_version: { type: DataTypes.STRING, allowNull: true },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  data_ultimo_acesso: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'dispositivos',
  timestamps: false
});

module.exports = { Device };