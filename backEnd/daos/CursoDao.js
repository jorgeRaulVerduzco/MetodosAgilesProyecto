const { Curso, Materia, Horario, Salon, Maestro, Alumno, Usuario, Asistencia } = require('../models');
const { Op } = require('sequelize');

class CursoDAO {
  /**
   * CREAR curso (simular ITSON)
   */
  async crear(data) {
    try {
      return await Curso.create(data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * OBTENER curso por ID con información completa
   */
  async obtenerPorId(id) {
    try {
      return await Curso.findByPk(id, {
        include: [
          { model: Materia, as: 'materia' },
          { model: Horario, as: 'horario' },
          { model: Salon, as: 'salon' },
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
      throw error;
    }
  }

  /**
   * OBTENER alumnos de un curso (HU06.1)
   */
  async obtenerAlumnos(cursoId) {
    try {
      const curso = await Curso.findByPk(cursoId, {
        include: [{
          model: Alumno,
          as: 'alumnos',
          through: { attributes: [] },
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombres', 'apellidos']
          }]
        }]
      });
      return curso ? curso.alumnos : [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * OBTENER asistencias con estadísticas (HU06.1)
   */
  async obtenerAsistenciasConEstadisticas(cursoId, filtros = {}) {
    try {
      const alumnos = await this.obtenerAlumnos(cursoId);
      const whereAsistencia = { cursoId };
      
      if (filtros.fechaInicio && filtros.fechaFin) {
        whereAsistencia.fechaHora = {
          [Op.between]: [filtros.fechaInicio, filtros.fechaFin]
        };
      }

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

      return resultado.sort((a, b) => a.apellidos.localeCompare(b.apellidos));
    } catch (error) {
      throw error;
    }
  }

  async existe(id) {
    try {
      const count = await Curso.count({ where: { id } });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CursoDAO();
