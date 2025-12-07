const {
  Maestro,
  Usuario,
  Curso,
  Materia,
  Horario,
  Salon,
  Alumno,
  Asistencia,
  CursoAlumno,
} = require("../models");
const { Op } = require("sequelize");

class MaestroDAO {
  /**
   * CREAR maestro (para seed/tests)
   */
  async crear(maestroId) {
    try {
      return await Maestro.create({ id: maestroId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU05.1 - Obtener cursos del maestro
   * Escenario 1: Maestro con cursos activos
   * Escenario 2: Maestro sin cursos
   */
  async obtenerCursos(maestroId, periodo) {
    try {
      const maestro = await Maestro.findByPk(maestroId, {
        include: [
          {
            model: Curso,
            as: "cursos",
            where: periodo ? { periodo } : {},
            required: false,
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
            ],
          },
        ],
      });

      if (!maestro) return [];

      // Obtener conteo de alumnos para cada curso
      const cursosConAlumnos = await Promise.all(
        maestro.cursos.map(async (curso) => {
          const alumnosCount = await CursoAlumno.count({
            where: { cursoId: curso.id },
          });

          return {
            ...curso.toJSON(),
            alumnosCount,
            grupo: curso.grupo || `Grupo ${curso.id}`,
          };
        })
      );

      // Ordenar por día y hora
      const diasOrden = {
        Lunes: 1,
        Martes: 2,
        Miércoles: 3,
        Jueves: 4,
        Viernes: 5,
        Sábado: 6,
      };

      return cursosConAlumnos.sort((a, b) => {
        const diaA = diasOrden[a.horario?.dia] || 7;
        const diaB = diasOrden[b.horario?.dia] || 7;

        if (diaA !== diaB) return diaA - diaB;

        // Si es el mismo día, ordenar por hora
        return (a.horario?.horaInicio || "").localeCompare(
          b.horario?.horaInicio || ""
        );
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU06.1 - Consultar asistencias por curso
   * Escenario 1: Visualización de tabla de asistencias
   * Escenario 4: Sin asistencias registradas
   */
  async obtenerAsistenciasPorCurso(cursoId, filtros = {}) {
    try {
      const { fechaInicio, fechaFin } = filtros;

      // Obtener curso con todos los alumnos inscritos
      const curso = await Curso.findByPk(cursoId, {
        include: [
          {
            model: Alumno,
            as: "alumnos",
            through: { attributes: [] },
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ["nombres", "apellidos"],
              },
              {
                model: Asistencia,
                as: "asistencias",
                where: {
                  cursoId,
                  ...(fechaInicio &&
                    fechaFin && {
                      fechaHora: {
                        [Op.between]: [fechaInicio, fechaFin],
                      },
                    }),
                },
                required: false,
              },
            ],
          },
          {
            model: Materia,
            as: "materia",
            attributes: ["nombre"],
          },
        ],
      });

      if (!curso) {
        return [];
      }

      // Si no hay alumnos inscritos, devolver array vacío
      if (!curso.alumnos || curso.alumnos.length === 0) {
        return [];
      }

      // Procesar datos de cada alumno
      const alumnosConAsistencias = curso.alumnos.map((alumno) => {
        // Asegurar que tenemos datos del usuario
        if (!alumno.usuario) {
          return null;
        }
        const totalAsistencias = alumno.asistencias.filter(
          (a) => a.estado === "presente"
        ).length;

        const totalFaltas = alumno.asistencias.filter(
          (a) => a.estado === "ausente"
        ).length;

        const totalJustificadas = alumno.asistencias.filter(
          (a) => a.estado === "justificado"
        ).length;

        // Escenario 3: Las faltas justificadas no afectan el porcentaje
        // Solo contamos presentes y ausentes para el cálculo
        const totalClases = totalAsistencias + totalFaltas;

        const porcentajeAsistencia =
          totalClases > 0 ? (totalAsistencias / totalClases) * 100 : 0;

        // Escenario 2: Indicadores visuales
        let nivelAsistencia = "normal"; // Verde
        if (porcentajeAsistencia < 70) {
          nivelAsistencia = "critico"; // Rojo
        } else if (porcentajeAsistencia < 85) {
          nivelAsistencia = "alerta"; // Naranja
        }

        return {
          id: alumno.id,
          nombreCompleto: `${alumno.usuario.apellidos} ${alumno.usuario.nombres}`,
          nombres: alumno.usuario.nombres,
          apellidos: alumno.usuario.apellidos,
          totalAsistencias,
          totalFaltas,
          porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100,
          nivelAsistencia,
        };
      }).filter(alumno => alumno !== null); // Filtrar nulos

      // Escenario 1: Ordenar alfabéticamente por apellido
      alumnosConAsistencias.sort((a, b) =>
        a.apellidos.localeCompare(b.apellidos)
      );

      return alumnosConAsistencias;
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU06.2 - Verificar detalle de asistencia de un alumno
   * Escenario 1: Vista detallada con historial
   */
  async obtenerDetalleAsistenciaAlumno(cursoId, alumnoId) {
    try {
      const asistencias = await Asistencia.findAll({
        where: {
          cursoId,
          alumnoId,
        },
        include: [
          {
            model: Curso,
            as: "curso",
            attributes: ["nombre"],
            include: [
              {
                model: Materia,
                as: "materia",
                attributes: ["nombre"],
              },
            ],
          },
        ],
        order: [["fechaHora", "DESC"]],
      });

      // Obtener info del alumno
      const alumno = await Alumno.findByPk(alumnoId, {
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombres", "apellidos"],
          },
        ],
      });

      if (!alumno) return null;

      // Calcular estadísticas
      const totalAsistencias = asistencias.filter(
        (a) => a.estado === "presente"
      ).length;
      const totalFaltas = asistencias.filter((a) => a.estado === "ausente")
        .length;
      const totalJustificadas = asistencias.filter(
        (a) => a.estado === "justificado"
      ).length;
      const totalClases = asistencias.length;
      const porcentajeAsistencia =
        totalClases > 0 ? (totalAsistencias / totalClases) * 100 : 0;

      return {
        alumno: {
          id: alumno.id,
          nombreCompleto: `${alumno.usuario.nombres} ${alumno.usuario.apellidos}`,
        },
        estadisticas: {
          totalAsistencias,
          totalFaltas,
          totalJustificadas,
          totalClases,
          porcentajeAsistencia: Math.round(porcentajeAsistencia * 100) / 100,
        },
        historial: asistencias.map((a) => ({
          id: a.id,
          fecha: a.fechaHora.toISOString().split('T')[0], // Formato YYYY-MM-DD para el input date
          fechaHora: a.fechaHora,
          fechaFormateada: a.fechaHora.toLocaleDateString("es-MX"),
          hora: a.fechaHora.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          estado: a.estado,
          ubicacion: a.ubicacionLat
            ? {
                lat: a.ubicacionLat,
                long: a.ubicacionLong,
              }
            : null,
          validada: a.validada,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU06.2 - Verificar/Modificar asistencia manualmente
   * Escenario 1: Verificación manual exitosa
   * Escenario 2: Corregir registro incorrecto
   */
  async modificarAsistencia(asistenciaId, nuevoEstado) {
    try {
      const asistencia = await Asistencia.findByPk(asistenciaId);

      if (!asistencia) {
        throw new Error("Asistencia no encontrada");
      }

      // Escenario 4: Bloqueo de fechas futuras
      const ahora = new Date();
      if (asistencia.fechaHora > ahora) {
        throw new Error(
          "No se pueden modificar asistencias para fechas futuras"
        );
      }

      asistencia.estado = nuevoEstado;
      asistencia.validada = true;
      await asistencia.save();

      return asistencia;
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU06.2 - Crear asistencia manual
   * Escenario 1: Verificación manual
   */
  async crearAsistenciaManual(datos) {
    try {
      const { alumnoId, cursoId, fechaHora, estado } = datos;

      // Escenario 4: Bloqueo de fechas futuras
      const ahora = new Date();
      const fecha = new Date(fechaHora);

      if (fecha > ahora) {
        throw new Error(
          "No se pueden registrar asistencias para fechas futuras"
        );
      }

      // Crear copia de fecha para el rango (evitar mutación)
      const fechaInicio = new Date(fechaHora);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(fechaHora);
      fechaFin.setHours(23, 59, 59, 999);

      // Verificar que no exista ya
      const existente = await Asistencia.findOne({
        where: {
          alumnoId,
          cursoId,
          fechaHora: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
      });

      // Si ya existe, actualizarla en lugar de crear una nueva
      if (existente) {
        existente.estado = estado;
        existente.validada = true;
        await existente.save();
        return existente;
      }

      const asistencia = await Asistencia.create({
        alumnoId,
        cursoId,
        fechaHora,
        estado,
        validada: true,
        ubicacionLat: null,
        ubicacionLong: null,
      });

      return asistencia;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar que el curso pertenece al maestro
   */
  async verificarCursoMaestro(cursoId, maestroId) {
    try {
      // Asegurar que cursoId sea número
      const cursoIdNumero = parseInt(cursoId, 10);
      
      // Validar que la conversión fue exitosa
      if (isNaN(cursoIdNumero)) {
        console.error('❌ cursoId no es un número válido:', cursoId);
        return false;
      }

      const curso = await Curso.findOne({
        where: {
          id: cursoIdNumero,      // Usar número
          maestroId: maestroId,   // maestroId ya es string
        },
      });

      return curso !== null;
    } catch (error) {
      console.error('❌ Error en verificarCursoMaestro:', error);
      throw error;
    }
  }
}

module.exports = new MaestroDAO();