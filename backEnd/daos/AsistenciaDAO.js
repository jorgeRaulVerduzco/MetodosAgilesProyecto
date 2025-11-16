const { Asistencia, Alumno, Curso, Materia, Usuario } = require('../models');
const { Op } = require('sequelize');

class AsistenciaDAO {
  /**
   * Crear una nueva asistencia
   * HU03.1 - Registrar asistencia a clase
   * @param {Object} data - Datos de la asistencia
   * @returns {Object} Asistencia creada
   */
  async crear(data) {
    try {
      return await Asistencia.create({
        fechaHora: data.fechaHora || new Date(),
        estado: data.estado || 'presente',
        ubicacionLat: data.ubicacionLat,
        ubicacionLong: data.ubicacionLong,
        validada: data.validada || true,
        alumnoId: data.alumnoId,
        cursoId: data.cursoId
      });
    } catch (error) {
      console.error('Error en crear asistencia:', error);
      throw error;
    }
  }

  /**
   * Verificar si ya existe una asistencia para hoy
   * HU03.1 - Escenario 4: Registro duplicado
   * @param {string} alumnoId - ID del alumno
   * @param {number} cursoId - ID del curso
   * @param {Date} fecha - Fecha a verificar (default: hoy)
   * @returns {boolean}
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
      console.error('Error en existeAsistenciaHoy:', error);
      throw error;
    }
  }

  /**
   * Obtener asistencias de un alumno en un curso
   * HU04.1 - Consultar historial de asistencias
   * @param {string} alumnoId - ID del alumno
   * @param {number} cursoId - ID del curso
   * @returns {Array} Lista de asistencias
   */
  async obtenerPorAlumnoCurso(alumnoId, cursoId) {
    try {
      return await Asistencia.findAll({
        where: { alumnoId, cursoId },
        order: [['fechaHora', 'DESC']],
        include: [{
          model: Curso,
          as: 'curso',
          include: [{
            model: Materia,
            as: 'materia'
          }]
        }]
      });
    } catch (error) {
      console.error('Error en obtenerPorAlumnoCurso:', error);
      throw error;
    }
  }

  /**
   * Contar asistencias por estado
   * HU04.1 - Para calcular porcentaje
   * @param {string} alumnoId - ID del alumno
   * @param {number} cursoId - ID del curso
   * @param {string} estado - Estado ('presente', 'ausente', 'justificado')
   * @returns {number}
   */
  async contarPorEstado(alumnoId, cursoId, estado) {
    try {
      return await Asistencia.count({
        where: { alumnoId, cursoId, estado }
      });
    } catch (error) {
      console.error('Error en contarPorEstado:', error);
      throw error;
    }
  }

  /**
   * Obtener última asistencia registrada
   * HU03.2 - Ver confirmación de asistencia registrada
   * @param {string} alumnoId - ID del alumno
   * @param {number} cursoId - ID del curso
   * @returns {Object|null}
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
            {
              model: Materia,
              as: 'materia'
            },
            {
              model: Salon,
              as: 'salon'
            }
          ]
        }]
      });
    } catch (error) {
      console.error('Error en obtenerUltimaAsistencia:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las asistencias de un alumno (todas las materias)
   * HU04.1 - Consultar historial de asistencias
   * @param {string} alumnoId - ID del alumno
   * @returns {Array}
   */
  async obtenerTodasPorAlumno(alumnoId) {
    try {
      return await Asistencia.findAll({
        where: { alumnoId },
        order: [['fechaHora', 'DESC']],
        include: [{
          model: Curso,
          as: 'curso',
          include: [{
            model: Materia,
            as: 'materia'
          }]
        }]
      });
    } catch (error) {
      console.error('Error en obtenerTodasPorAlumno:', error);
      throw error;
    }
  }
}

module.exports = new AsistenciaDAO();