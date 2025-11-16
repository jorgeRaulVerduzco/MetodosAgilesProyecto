const { Alumno, Usuario, Curso, Materia, Horario, Salon, Maestro, Asistencia } = require('../models');

class AlumnoDAO {
  /**
   * Obtener alumno por ID con información de usuario
   * @param {string} id - ID del alumno
   * @returns {Object|null}
   */
  async obtenerPorId(id) {
    try {
      return await Alumno.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuario'
        }]
      });
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * 🆕 Obtener clases del alumno para HOY (solo el día actual)
   * Para mostrar en "Registrar Asistencia"
   * @param {string} alumnoId - ID del alumno
   * @param {string} diaActual - Día de la semana (ej: "Lunes", "Martes")
   * @returns {Array} Lista de cursos que tocan hoy
   */
  async obtenerClasesHoy(alumnoId, diaActual) {
    try {
      const alumno = await Alumno.findByPk(alumnoId, {
        include: [{
          model: Curso,
          as: 'cursos',
          include: [
            {
              model: Materia,
              as: 'materia',
              attributes: ['id', 'codigo', 'nombre']
            },
            {
              model: Horario,
              as: 'horario',
              where: { dia: diaActual }, // 🎯 FILTRAR SOLO POR DÍA ACTUAL
              attributes: ['id', 'dia', 'horaInicio', 'horaFin']
            },
            {
              model: Salon,
              as: 'salon',
              attributes: ['id', 'aula', 'edificio', 'ubicacionLat', 'ubicacionLong']
            },
            {
              model: Maestro,
              as: 'maestro',
              include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['nombres', 'apellidos']
              }]
            }
          ]
        }]
      });

      return alumno ? alumno.cursos : [];
    } catch (error) {
      console.error('Error en obtenerClasesHoy:', error);
      throw error;
    }
  }

  /**
   * Obtener horario completo de clases del alumno (periodo actual)
   * HU02.1 - Ver horario de clases
   * @param {string} alumnoId - ID del alumno
   * @param {string} periodo - Periodo académico (ej: "2025-2")
   * @returns {Array} Lista de TODOS los cursos del periodo
   */
  async obtenerHorario(alumnoId, periodo) {
    try {
      const alumno = await Alumno.findByPk(alumnoId, {
        include: [{
          model: Curso,
          as: 'cursos',
          where: { periodo },
          include: [
            {
              model: Materia,
              as: 'materia',
              attributes: ['id', 'codigo', 'nombre']
            },
            {
              model: Horario,
              as: 'horario',
              attributes: ['id', 'dia', 'horaInicio', 'horaFin']
            },
            {
              model: Salon,
              as: 'salon',
              attributes: ['id', 'aula', 'edificio', 'ubicacionLat', 'ubicacionLong']
            },
            {
              model: Maestro,
              as: 'maestro',
              include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['nombres', 'apellidos']
              }]
            }
          ]
        }]
      });

      return alumno ? alumno.cursos : [];
    } catch (error) {
      console.error('Error en obtenerHorario:', error);
      throw error;
    }
  }

  /**
   * Verificar si el alumno está inscrito en un curso
   * @param {string} alumnoId - ID del alumno
   * @param {number} cursoId - ID del curso
   * @returns {boolean}
   */
  async estaInscritoEnCurso(alumnoId, cursoId) {
    try {
      const { CursoAlumno } = require('../models');
      const count = await CursoAlumno.count({
        where: { alumnoId, cursoId }
      });
      return count > 0;
    } catch (error) {
      console.error('Error en estaInscritoEnCurso:', error);
      throw error;
    }
  }

  /**
   * Obtener asistencias del alumno en un curso específico
   * @param {string} alumnoId - ID del alumno
   * @param {number} cursoId - ID del curso
   * @returns {Array} Lista de asistencias
   */
  async obtenerAsistenciasPorCurso(alumnoId, cursoId) {
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
      console.error('Error en obtenerAsistenciasPorCurso:', error);
      throw error;
    }
  }
}

module.exports = new AlumnoDAO();