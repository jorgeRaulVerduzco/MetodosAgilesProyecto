"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Usuario tiene un Alumno
      Usuario.hasOne(models.Alumno, {
        foreignKey: "id",
        as: "perfilAlumno",
      });

      // Usuario tiene un Maestro
      Usuario.hasOne(models.Maestro, {
        foreignKey: "id",
        as: "perfilMaestro",
      });
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      nombres: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      apellidos: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      tipoUsuario: {
        type: DataTypes.ENUM("alumno", "maestro"),
        allowNull: false,
        validate: {
          isIn: [["alumno", "maestro"]],
        },
      },
      contrasenia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255],
        },
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "Usuarios",
      timestamps: true,
    }
  );

  return Usuario;
};
