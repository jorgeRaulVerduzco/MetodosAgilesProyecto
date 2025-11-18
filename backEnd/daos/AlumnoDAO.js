const {
  Alumno,
  Usuario,
  Curso,
  Materia,
  Horario,
  Salon,
  Maestro,
  CursoAlumno,
  Asistencia, // <-- IMPORTAR ASISTENCIA
} = require("../models");
class AlumnoDAO {
  /**
   * INSCRIBIR alumno en curso (simular ITSON)
   */
  async inscribirEnCurso(alumnoId, cursoId) {
    try {
      return await CursoAlumno.create({
        alumnoId,
        cursoId,
        fechaInscripcion: new Date(),
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
        include: [
          {
            model: Curso,
            as: "cursos",
            include: [
              {
                model: Materia,
                as: "materia",
                attributes: ["id", "codigo", "nombre"],
              },
              {
                model: Horario,
                as: "horario",
                where: { dia: diaActual },
                attributes: ["id", "dia", "horaInicio", "horaFin"],
              },
              {
                model: Salon,
                as: "salon",
                attributes: [
                  "id",
                  "aula",
                  "edificio",
                  "ubicacionLat",
                  "ubicacionLong",
                ],
              },
              {
                model: Maestro,
                as: "maestro",
                include: [
                  {
                    model: Usuario,
                    as: "usuario",
                    attributes: ["nombres", "apellidos"],
                  },
                ],
              },
            ],
          },
        ],
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
        include: [
          {
            model: Curso,
            as: "cursos",
            where: { periodo },
            include: [
              {
                model: Materia,
                as: "materia",
                attributes: ["id", "codigo", "nombre"],
              },
              {
                model: Horario,
                as: "horario",
                attributes: ["id", "dia", "horaInicio", "horaFin"],
              },
              {
                model: Salon,
                as: "salon",
                attributes: ["id", "aula", "edificio"],
              },
              {
                model: Maestro,
                as: "maestro",
                include: [
                  {
                    model: Usuario,
                    as: "usuario",
                    attributes: ["nombres", "apellidos"],
                  },
                ],
              },
            ],
          },
        ],
      });

      return alumno ? alumno.cursos : [];
    } catch (error) {
      throw error;
    }
  }

  async obtenerAsistenciasPorCurso(alumnoId, cursoId) {
    try {
      // Aseguramos tipos
      const aId = String(alumnoId);
      const cId = parseInt(cursoId);

      // Buscar asistencias filtrando por alumno y curso
      const asistencias = await Asistencia.findAll({
        where: {
          alumnoId: aId,
          cursoId: cId,
        },
        order: [["fechaHora", "DESC"]],
      });

      return asistencias || [];
    } catch (error) {
      console.error("Error en AlumnoDAO.obtenerAsistenciasPorCurso:", error);
      throw error;
    }
  }
  async estaInscritoEnCurso(alumnoId, cursoId) {
    try {
      const count = await CursoAlumno.count({
        where: { alumnoId, cursoId },
      });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  async obtenerHistorialAsistencias(alumnoId) {
    try {
      // Traer todos los cursos donde está inscrito el alumno
      const alumno = await Alumno.findByPk(alumnoId, {
        include: [
          {
            model: Curso,
            as: "cursos",
            include: [
              {
                model: Asistencia,
                as: "asistencias",
                where: { alumnoId },
                required: false, // para traer cursos aunque no tenga asistencias
              },
              {
                model: Materia,
                as: "materia",
                attributes: ["codigo", "nombre"],
              },
            ],
          },
        ],
      });

      if (!alumno) return [];

      // Formatear resultado por curso
      return alumno.cursos.map((curso) => {
        const totalAsistencias = curso.asistencias.filter(
          (a) => a.estado === "presente"
        ).length;
        const totalFaltas = curso.asistencias.filter(
          (a) => a.estado !== "presente"
        ).length;
        const porcentaje =
          curso.asistencias.length > 0
            ? (totalAsistencias / curso.asistencias.length) * 100
            : 0;

        return {
          cursoId: curso.id,
          nombre: curso.nombre,
          grupo: curso.grupo,
          materia: curso.materia.nombre,
          totalAsistencias,
          totalFaltas,
          porcentajeAsistencia: Math.round(porcentaje),
          detalles: curso.asistencias.map((a) => ({
            id: a.id,
            fecha: a.fechaHora,
            estado: a.estado,
          })),
        };
      });
    } catch (error) {
      console.error("Error en AlumnoDAO.obtenerHistorialAsistencias:", error);
      throw error;
    }
  }
}

module.exports = new AlumnoDAO();
