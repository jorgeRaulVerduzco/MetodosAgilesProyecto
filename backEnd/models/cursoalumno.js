'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CursoAlumno extends Model {
    static associate(models) {
      // Relaciones explícitas si las necesitas
      CursoAlumno.belongsTo(models.Curso, {
        foreignKey: 'cursoId',
        as: 'curso'
      });

      CursoAlumno.belongsTo(models.Alumno, {
        foreignKey: 'alumnoId',
        as: 'alumno'
      });
    }
  }

  CursoAlumno.init({
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    alumnoId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaInscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'CursoAlumno',
    tableName: 'CursoAlumnos',
    timestamps: true
  });

  return CursoAlumno;
};
