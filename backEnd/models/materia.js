'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Materia extends Model {
    static associate(models) {
      // Materia tiene muchos cursos
      Materia.hasMany(models.Curso, {
        foreignKey: 'materiaId',
        as: 'cursos'
      });
    }
  }

  Materia.init({
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Materia',
    tableName: 'Materias',
    timestamps: true
  });

  return Materia;
};