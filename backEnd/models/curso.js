'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Curso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Curso.init({
    nombre: DataTypes.STRING,
    grupo: DataTypes.STRING,
    periodo: DataTypes.STRING,
    numeroAlumnos: DataTypes.INTEGER,
    horarioId: DataTypes.INTEGER,
    salonId: DataTypes.INTEGER,
    materiaId: DataTypes.INTEGER,
    maestroId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Curso',
  });
  return Curso;
};