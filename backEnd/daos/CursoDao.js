const { Curso, Materia, Horario, Salon, Maestro, Alumno, Usuario, Asistencia } = require('../models');

class CursoDAO {
  /**
   * Obtener curso por ID con toda la información
   * @param {number} id - ID del curso
   * @returns {Object|null}
   */
  async obtenerPorId(id) {
    try {
      return await Curso.findByPk(id, {
        include: [
          {
            model: Materia,
            as: 'materia'
          },
          {
            model: Horario,
            as: 'horario'
          },
          {
            model: Salon,
            as: 'salon'
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
      });
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Obtener cursos de un maestro
   * HU05.1 - Consultar cursos
   * @param {string} maestroId - ID del maestro
   * @param {string} periodo - Periodo académico
   * @returns {Array}
   */
  async obtenerPorMaestro(maestroId, periodo) {
    try {
      return await Curso.findAll({
        where: { 
          maestroId,
          periodo 
        },
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
            attributes: ['id', 'aula', 'edificio']
          }
        ],
        order: [
          [{ model: Horario, as: 'horario' }, 'dia', 'ASC'],
          [{ model: Horario, as: 'horario' }, 'horaInicio', 'ASC']
        ]
      });
    } catch (error) {
      console.error('Error en obtenerPorMaestro:', error);
      throw error;
    }
  }

  /**
   * Obtener alumnos inscritos en un curso
   * HU06.1 - Consultar asistencias por curso
   * @param {number} cursoId - ID del curso
   * @returns {Array}
   */
  async obtenerAlumnos(cursoId) {
    try {
      const curso = await Curso.findByPk(cursoId, {
        include: [{
          model: Alumno,
          as: 'alumnos',
          through: { attributes: [] }, // No incluir datos de CursoAlumno
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombres', 'apellidos']
          }]
        }]
      });

      return curso ? curso.alumnos : [];
    } catch (error) {
      console.error('Error en obtenerAlumnos:', error);
      throw error;
    }
  }

  /**
   * Obtener asistencias de un curso con estadísticas por alumno
   * HU06.1 - Consultar asistencias por curso
   * @param {number} cursoId - ID del curso
   * @param {Object} filtros - Filtros opcionales (fechaInicio, fechaFin)
   * @returns {Array}
   */
  async obtenerAsistenciasConEstadisticas(cursoId, filtros = {}) {
    try {
      // 1. Obtener todos los alumnos del curso
      const alumnos = await this.obtenerAlumnos(cursoId);

      // 2. Construir where para asistencias
      const whereAsistencia = { cursoId };
      
      if (filtros.fechaInicio && filtros.fechaFin) {
        whereAsistencia.fechaHora = {
          [Op.between]: [filtros.fechaInicio, filtros.fechaFin]
        };
      }

      // 3. Obtener asistencias con estadísticas por alumno
      const resultado = await Promise.all(
        alumnos.map(async (alumno) => {
          const asistencias = await Asistencia.findAll({
            where: {
              ...whereAsistencia,
              alumnoId: alumno.id
            }
          });

          const totalPresente = asistencias.filter(a => a.estado === 'presente').length;
          const totalAusente = asistencias.filter(a => a.estado === 'ausente').length;
          const total = asistencias.length;
          const porcentaje = total > 0 ? (totalPresente / total * 100).toFixed(2) : 0;

          return {
            id: alumno.id,
            nombres: alumno.usuario.nombres,
            apellidos: alumno.usuario.apellidos,
            nombreCompleto: `${alumno.usuario.apellidos} ${alumno.usuario.nombres}`,
            totalAsistencias: totalPresente,
            totalFaltas: totalAusente,
            porcentajeAsistencia: parseFloat(porcentaje),
            asistencias: asistencias
          };
        })
      );

      // 4. Ordenar alfabéticamente por apellido
      return resultado.sort((a, b) => 
        a.apellidos.localeCompare(b.apellidos)
      );
    } catch (error) {
      console.error('Error en obtenerAsistenciasConEstadisticas:', error);
      throw error;
    }
  }

  /**
   * Verificar si un curso existe
   * @param {number} id - ID del curso
   * @returns {boolean}
   */
  async existe(id) {
    try {
      const count = await Curso.count({ where: { id } });
      return count > 0;
    } catch (error) {
      console.error('Error en existe:', error);
      throw error;
    }
  }
}

module.exports = new CursoDAO();
