const { Salon } = require("../models");

class SalonDAO {
  /**
   * CREAR salón
   */
  async crear(data) {
    try {
      return await Salon.create(data);
    } catch (error) {
      throw error;
    }
  }
  async obtenerTodos() {
    try {
      return await Salon.findAll({
        order: [
          ["edificio", "ASC"],
          ["aula", "ASC"],
        ],
      });
    } catch (error) {
      console.error("Error en obtenerTodos:", error);
      throw error;
    }
  }
  async obtenerPorId(id) {
    try {
      return await Salon.findByPk(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SalonDAO();
