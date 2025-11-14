const Horario = require("../models/horario.js");

class HorarioDao {
  constructor() {}

  async crear(datos) {
    try {
      return await Horario.create(datos);
    } catch (error) {
      throw new Error(error);
    }
  }

  async obtenerHorarios() {
    try {
      return await Horario.findAll();
    } catch (error) {
      throw new Error(error);
    }
  }

  async obtenerHorariosPorId(id) {
    try {
      return await Horario.findByPk(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async eliminarHorario(id) {
    try {
      const horario = await Horario.findByPk(id);
      if (horario === null) {
        return "Ese horario, no existe";
      }
      await Horario.destroy();
      return "horario eliminado con exito";
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = new HorarioDao();
