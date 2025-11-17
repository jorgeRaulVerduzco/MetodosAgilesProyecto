const { Asistencia, Curso, Materia, Salon } = require('../models');
const { Op } = require('sequelize');

class AsistenciaDAO {
  /**
   * CREAR asistencia (HU03.1)
   */
  async crear(data) {
    try {
      return await Asistencia.create({
        fechaHora: data.fechaHora || new Date(),
        estado: data.estado || 'presente',
        ubicacionLat: data.ubicacionLat,
        ubicacionLong: data.ubicacionLong,
        validada: data.validada !== undefined ? data.validada : true,
        alumnoId: data.alumnoId,
        cursoId: data.cursoId
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * EXISTE asistencia hoy (HU03.1 - Escenario 4: registro duplicado)
   */
  async existeAsistenciaHoy(alumnoId, cursoId, fecha = new Date()) {
    try {
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);
      
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);

      const count = await Asistencia.count({
        where: {
          alumnoId,
          cursoId,
          fechaHora: {
            [Op.between]: [inicioDia, finDia]
          }
        }
      });

      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * OBTENER última asistencia (HU03.2 - confirmación)
   */
  async obtenerUltimaAsistencia(alumnoId, cursoId) {
    try {
      return await Asistencia.findOne({
        where: { alumnoId, cursoId },
        order: [['fechaHora', 'DESC']],
        include: [{
          model: Curso,
          as: 'curso',
          include: [
            { model: Materia, as: 'materia' },
            { model: Salon, as: 'salon' }
          ]
        }]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * OBTENER por alumno y curso (HU04.1 - historial)
   */
  async obtenerPorAlumnoCurso(alumnoId, cursoId) {
    try {
      return await Asistencia.findAll({
        where: { alumnoId, cursoId },
        order: [['fechaHora', 'DESC']],
        include: [{
          model: Curso,
          as: 'curso',
          include: [{ model: Materia, as: 'materia' }]
        }]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AsistenciaDAO();
