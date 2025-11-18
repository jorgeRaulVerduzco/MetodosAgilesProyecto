'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Maestro extends Model {
    static associate(models) {
      // Maestro pertenece a Usuario
      Maestro.belongsTo(models.Usuario, {
        foreignKey: 'id',
        as: 'usuario'
      });

      // Maestro tiene muchos cursos
      Maestro.hasMany(models.Curso, {
        foreignKey: 'maestroId',
        as: 'cursos'
      });
    }
  }

  Maestro.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Maestro',
    tableName: 'Maestros',
    timestamps: true
  });

  return Maestro;
};