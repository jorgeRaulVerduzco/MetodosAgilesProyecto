'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Alumno extends Model {
    static associate(models) {
      // Alumno pertenece a Usuario
      Alumno.belongsTo(models.Usuario, {
        foreignKey: 'id',
        as: 'usuario'
      });

      // Alumno tiene muchas asistencias
      Alumno.hasMany(models.Asistencia, {
        foreignKey: 'alumnoId',
        as: 'asistencias'
      });

      // Alumno pertenece a muchos Cursos (muchos a muchos)
      Alumno.belongsToMany(models.Curso, {
        through: 'CursoAlumnos',
        foreignKey: 'alumnoId',
        otherKey: 'cursoId',
        as: 'cursos'
      });
    }
  }

  Alumno.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Alumno',
    tableName: 'Alumnos',
    timestamps: true
  });

  return Alumno;
};

