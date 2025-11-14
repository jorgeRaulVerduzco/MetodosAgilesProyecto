const { where } = require("sequelize");
const { Materia } = require("./../models/materia.js");

class MateriaDAO {
  constructor() {}

  async crear(datos) {
    try {
      return await Materia.create(datos);
    } catch (error) {
      throw new Error(error);
    }
  }

  async obtenerMaterias() {
    try {
      return await Materia.findAll();
    } catch (error) {
      throw new Error(error);
    }
  }

  async obtenerMateriasPorId(id) {
    try {
      return await Materia.findByPk(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async eliminarMateria(id) {
    try {
      const materia = Materia.findByPk(id);
      if (materia === null) {
        return "Esta materia no existe";
      }
      return materia.destroy();
    } catch (error) {
      throw new Error(error);
    }
  }

  async EditarMateria(id, datos) {
    try {
      await Materia.Update(datos, { where: { id } });

      const materia = await Materia.findByPk(id);

      return materia;
    } catch (error) {}
  }
}

module.exports = new MateriaDAO();
