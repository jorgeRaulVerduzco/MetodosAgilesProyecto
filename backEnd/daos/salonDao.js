const Salon = require("../models/salon.js");

class SalonDao {
  constructor() {}

  async crear(datos) {
    try {
      return await Salon.create(datos);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      return await Salon.findAll();
    } catch (error) {
      throw new Error(error);
    }
  }

  async findById(id) {
    try {
      return await Salon.findByPk(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
