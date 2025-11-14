'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Asistencia extends Model {
    static associate(models) {
      // Asistencia pertenece a Alumno
      Asistencia.belongsTo(models.Alumno, {
        foreignKey: 'alumnoId',
        as: 'alumno'
      });

      // Asistencia pertenece a Curso
      Asistencia.belongsTo(models.Curso, {
        foreignKey: 'cursoId',
        as: 'curso'
      });
    }
  }

  Asistencia.init({
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM('presente', 'ausente', 'justificado'),
      allowNull: false,
      defaultValue: 'presente',
      validate: {
        isIn: [['presente', 'ausente', 'justificado']]
      }
    },
    ubicacionLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: -90,
        max: 90
      }
    },
    ubicacionLong: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: -180,
        max: 180
      }
    },
    validada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    alumnoId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Asistencia',
    tableName: 'Asistencias',
    timestamps: true
  });

  return Asistencia;
};