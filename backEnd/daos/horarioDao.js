const { Horario } = require('../models');

class HorarioDAO {
  
  async crear(data) {
    try {
      return await Horario.create(data);
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await Horario.findByPk(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new HorarioDAO();
