'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Horario extends Model {
    static associate(models) {
      // Horario tiene muchos cursos
      Horario.hasMany(models.Curso, {
        foreignKey: 'horarioId',
        as: 'cursos'
      });
    }
  }

  Horario.init({
    dia: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']]
      }
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    periodo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Horario',
    tableName: 'Horarios',
    timestamps: true
  });

  return Horario;
};

