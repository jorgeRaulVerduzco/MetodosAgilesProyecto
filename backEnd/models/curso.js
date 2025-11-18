'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Curso extends Model {
    static associate(models) {
      // Curso pertenece a Materia
      Curso.belongsTo(models.Materia, {
        foreignKey: 'materiaId',
        as: 'materia'
      });

      // Curso pertenece a Horario
      Curso.belongsTo(models.Horario, {
        foreignKey: 'horarioId',
        as: 'horario'
      });

      // Curso pertenece a Salon
      Curso.belongsTo(models.Salon, {
        foreignKey: 'salonId',
        as: 'salon'
      });

      // Curso pertenece a Maestro
      Curso.belongsTo(models.Maestro, {
        foreignKey: 'maestroId',
        as: 'maestro'
      });

      // Curso tiene muchas asistencias
      Curso.hasMany(models.Asistencia, {
        foreignKey: 'cursoId',
        as: 'asistencias'
      });

      // Curso pertenece a muchos Alumnos (muchos a muchos)
      Curso.belongsToMany(models.Alumno, {
        through: 'CursoAlumnos',
        foreignKey: 'cursoId',
        otherKey: 'alumnoId',
        as: 'alumnos'
      });
    }
  }

  Curso.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grupo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    periodo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numeroAlumnos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    horarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    materiaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    maestroId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Curso',
    tableName: 'Cursos',
    timestamps: true
  });

  return Curso;
};