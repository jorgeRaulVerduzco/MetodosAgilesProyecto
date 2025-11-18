'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Salon extends Model {
    static associate(models) {
      // Salon tiene muchos cursos
      Salon.hasMany(models.Curso, {
        foreignKey: 'salonId',
        as: 'cursos'
      });
    }
  }

  Salon.init({
    aula: {
      type: DataTypes.STRING,
      allowNull: false
    },
    edificio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ubicacionLat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    ubicacionLong: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'Salon',
    tableName: 'Salones',
    timestamps: true
  });

  return Salon;
};