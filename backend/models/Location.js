const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  tipo_coordenada_id: { type: DataTypes.INTEGER, allowNull: false },
  criador_id: { type: DataTypes.INTEGER, allowNull: true },
  data_criacao: { type: DataTypes.DATE, allowNull: true },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'locais',
  timestamps: false
});

module.exports = { Location };