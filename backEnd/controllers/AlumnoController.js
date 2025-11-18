const AlumnoDAO = require("../daos/AlumnoDAO");

class AlumnoController {
  /**
   * GET /api/alumno/obtenerHorario/:periodo
   * MOCKUP 2: MI HORARIO
   * HU02.1 - Ver horario de clases
   * MISMO NOMBRE QUE DAO: obtenerHorario()
   */
  async obtenerHorario(req, res) {
    try {
      const alumnoId = req.userId;
      const { periodo } = req.params;

      const cursos = await AlumnoDAO.obtenerHorario(alumnoId, periodo);

      // Escenario 2: Sin clases asignadas
      if (cursos.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No tienes clases asignadas este periodo",
          data: {
            cursos: [],
            periodo,
          },
        });
      }

      // Escenario 1: Con clases asignadas
      const cursosFormateados = cursos.map((curso) => ({
        id: curso.id,
        nombre: curso.nombre,
        grupo: curso.grupo,
        materia: {
          codigo: curso.materia.codigo,
          nombre: curso.materia.nombre,
        },
        horario: {
          dia: curso.horario.dia,
          horaInicio: curso.horario.horaInicio,
          horaFin: curso.horario.horaFin,
        },
        salon: {
          aula: curso.salon.aula,
          edificio: curso.salon.edificio,
        },
        maestro: {
          nombres: curso.maestro.usuario.nombres,
          apellidos: curso.maestro.usuario.apellidos,
        },
      }));

      return res.status(200).json({
        success: true,
        message: "Horario obtenido exitosamente",
        data: {
          cursos: cursosFormateados,
          periodo,
        },
      });
    } catch (error) {
      console.error("Error en obtenerHorario:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener horario",
      });
    }
  }

  /**
   * GET /api/alumno/obtenerClasesHoy
   * MOCKUP 3: REGISTRAR ASISTENCIA
   * HU03.1 - Obtener clases de hoy (CLAVE DEL SPRINT 1)
   * MISMO NOMBRE QUE DAO: obtenerClasesHoy()
   */
  async obtenerClasesHoy(req, res) {
    try {
      const alumnoId = req.userId;

      // Obtener día y hora actual
      const ahora = new Date();
      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const diaActual = diasSemana[ahora.getDay()];
      const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

      // LLAMAR AL DAO CON EL MISMO NOMBRE
      const clasesHoy = await AlumnoDAO.obtenerClasesHoy(alumnoId, diaActual);

      if (clasesHoy.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No tienes clases hoy",
          data: {
            clases: [],
            diaActual,
            horaActual: ahora.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        });
      }

      // para checar que este en el horario de clkase
      const clasesConEstado = clasesHoy.map((curso) => {
        const [horaInicioH, horaInicioM] = curso.horario.horaInicio
          .split(":")
          .map(Number);
        const [horaFinH, horaFinM] = curso.horario.horaFin
          .split(":")
          .map(Number);

        const horaInicio = horaInicioH * 60 + horaInicioM;
        const horaFin = horaFinH * 60 + horaFinM;

        const margen = 15;
        const enHorario =
          horaActual >= horaInicio - margen && horaActual <= horaFin + margen;

        return {
          id: curso.id,
          nombre: curso.materia.nombre,
          horario: {
            horaInicio: curso.horario.horaInicio,
            horaFin: curso.horario.horaFin,
          },
          salon: {
            aula: curso.salon.aula,
            edificio: curso.salon.edificio,
            ubicacionLat: curso.salon.ubicacionLat,
            ubicacionLong: curso.salon.ubicacionLong,
          },
          maestro: {
            nombres: curso.maestro.usuario.nombres,
            apellidos: curso.maestro.usuario.apellidos,
          },
          enHorario, // true = puede registrar asistencia
          estadoUbicacion: true, // Simulado
        };
      });

      return res.status(200).json({
        success: true,
        message: "Clases de hoy obtenidas",
        data: {
          clases: clasesConEstado,
          diaActual,
          horaActual: ahora.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      });
    } catch (error) {
      console.error("Error en obtenerClasesHoy:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener clases de hoy",
      });
    }
  }

  async estaInscritoEnCurso(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const estaInscrito = await AlumnoDAO.estaInscritoEnCurso(
        alumnoId,
        parseInt(cursoId)
      );

      return res.status(200).json({
        success: true,
        data: { estaInscrito },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al verificar inscripción",
      });
    }
  }

  async obtenerAsistenciasPorCurso(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const asistencias = await AlumnoDAO.obtenerAsistenciasPorCurso(
        alumnoId,
        parseInt(cursoId)
      );

      if (asistencias.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No hay asistencias registradas",
          data: {
            asistencias: [],
            totalAsistencias: 0,
            totalFaltas: 0,
            porcentajeAsistencia: 0,
          },
        });
      }

      const totalPresente = asistencias.filter(
        (a) => a.estado === "presente"
      ).length;
      const total = asistencias.length;
      const porcentaje = ((totalPresente / total) * 100).toFixed(2);

      return res.status(200).json({
        success: true,
        message: "Asistencias obtenidas exitosamente",
        data: {
          asistencias: asistencias.map((a) => ({
            id: a.id,
            fecha: a.fechaHora,
            estado: a.estado,
          })),
          totalAsistencias: totalPresente,
          totalFaltas: total - totalPresente,
          porcentajeAsistencia: parseFloat(porcentaje),
        },
      });
    } catch (error) {
      console.error("Error en obtenerAsistenciasPorCurso:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener asistencias",
      });
    }
  }

  async obtenerHistorialAsistencias(req, res) {
    try {
      const alumnoId = req.userId;

      const historial = await AlumnoDAO.obtenerHistorialAsistencias(alumnoId);

      return res.status(200).json({
        success: true,
        message:
          historial.length > 0
            ? "Historial obtenido"
            : "No hay asistencias registradas",
        data: historial,
      });
    } catch (error) {
      console.error("Error en obtenerHistorialAsistencias:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener historial de asistencias",
      });
    }
  }
}

module.exports = new AlumnoController();
