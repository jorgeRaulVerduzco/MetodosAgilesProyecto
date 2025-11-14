'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Salon.init({
    aula: DataTypes.STRING,
    edificio: DataTypes.STRING,
    ubicacionLat: DataTypes.FLOAT,
    ubicacionLong: DataTypes.FLOAT,
    capacidad: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Salon',
  });
  return Salon;
};