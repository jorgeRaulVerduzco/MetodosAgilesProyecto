const { Materia } = require('../models');

class MateriaDAO {

  async crear(data) {
    try {
      return await Materia.create(data);
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await Materia.findByPk(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MateriaDAO();
