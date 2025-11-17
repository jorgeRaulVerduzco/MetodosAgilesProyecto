const { Alumno, Usuario, Curso, Materia, Horario, Salon, Maestro, CursoAlumno } = require('../models');

class AlumnoDAO {
  /**
   * INSCRIBIR alumno en curso (simular ITSON)
   */
  async inscribirEnCurso(alumnoId, cursoId) {
    try {
      return await CursoAlumno.create({
        alumnoId,
        cursoId,
        fechaInscripcion: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * OBTENER clases de HOY (HU03.1 - CLAVE PARA EL SPRINT 1)
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
              where: { dia: diaActual },
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
      throw error;
    }
  }

  /**
   * OBTENER horario completo (HU02.1)
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
              attributes: ['id', 'aula', 'edificio']
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
      throw error;
    }
  }

  /**
   * VERIFICAR si está inscrito (HU03.1 - validación)
   */
  async estaInscritoEnCurso(alumnoId, cursoId) {
    try {
      const count = await CursoAlumno.count({
        where: { alumnoId, cursoId }
      });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AlumnoDAO();