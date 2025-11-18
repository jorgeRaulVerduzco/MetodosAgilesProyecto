const AsistenciaDAO = require('../daos/AsistenciaDAO');
const AlumnoDAO = require('../daos/AlumnoDAO');
const CursoDAO = require('../daos/CursoDAO');

class AsistenciaController {
  /**
   * POST /api/asistencia/crear
   * HU03.1 - Registrar asistencia a clase
   * MISMO NOMBRE QUE DAO: crear()
   */
  async crear(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId, ubicacionLat, ubicacionLong } = req.body;

      if (!cursoId) {
        return res.status(400).json({
          success: false,
          message: 'El ID del curso es requerido'
        });
      }

      // Verificar inscripción
      const estaInscrito = await AlumnoDAO.estaInscritoEnCurso(alumnoId, cursoId);
      if (!estaInscrito) {
        return res.status(403).json({
          success: false,
          message: 'No estás inscrito en este curso'
        });
      }

      // Escenario 4: Registro duplicado
      const yaRegistro = await AsistenciaDAO.existeAsistenciaHoy(alumnoId, cursoId);
      if (yaRegistro) {
        return res.status(400).json({
          success: false,
          message: 'Asistencia ya registrada'
        });
      }

      // Obtener información del curso
      const curso = await CursoDAO.obtenerPorId(cursoId);
      if (!curso) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      // Escenario 2: Validar horario
      const ahora = new Date();
      const [horaInicioH, horaInicioM] = curso.horario.horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = curso.horario.horaFin.split(':').map(Number);
      
      const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
      const horaInicio = horaInicioH * 60 + horaInicioM;
      const horaFin = horaFinH * 60 + horaFinM;
      
      const margen = 15;
      const dentroDeHorario = (horaActual >= horaInicio - margen) && (horaActual <= horaFin + margen);

      if (!dentroDeHorario) {
        return res.status(400).json({
          success: false,
          message: 'Fuera del horario de clase'
        });
      }

      // Escenario 3: Validar ubicación (simulado)
      const dentroDelSalon = true;

      if (!dentroDelSalon) {
        return res.status(400).json({
          success: false,
          message: 'Ubicación incorrecta'
        });
      }

      // Escenario 1: Registrar asistencia válida
      // LLAMAR AL DAO CON EL MISMO NOMBRE: crear()
      const asistencia = await AsistenciaDAO.crear({
        alumnoId,
        cursoId,
        fechaHora: new Date(),
        estado: 'presente',
        ubicacionLat: ubicacionLat || curso.salon.ubicacionLat,
        ubicacionLong: ubicacionLong || curso.salon.ubicacionLong,
        validada: true
      });

      // HU03.2: Obtener confirmación
      const confirmacion = await AsistenciaDAO.obtenerUltimaAsistencia(alumnoId, cursoId);

      return res.status(201).json({
        success: true,
        message: 'Asistencia registrada exitosamente',
        data: {
          asistencia: {
            id: confirmacion.id,
            fechaHora: confirmacion.fechaHora,
            materia: confirmacion.curso.materia.nombre,
            salon: `Edificio ${confirmacion.curso.salon.edificio} - Aula ${confirmacion.curso.salon.aula}`,
            hora: ahora.toLocaleTimeString('es-MX')
          }
        }
      });

    } catch (error) {
      console.error('Error en crear asistencia:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al registrar asistencia'
      });
    }
  }

  /**
   * GET /api/asistencia/existeAsistenciaHoy/:cursoId
   * Verificar si ya registró hoy
   * MISMO NOMBRE QUE DAO: existeAsistenciaHoy()
   */
  async existeAsistenciaHoy(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const existe = await AsistenciaDAO.existeAsistenciaHoy(alumnoId, parseInt(cursoId));

      return res.status(200).json({
        success: true,
        data: { existe }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar asistencia'
      });
    }
  }

  /**
   * GET /api/asistencia/obtenerUltimaAsistencia/:cursoId
   * HU03.2 - Ver confirmación
   * MISMO NOMBRE QUE DAO: obtenerUltimaAsistencia()
   */
  async obtenerUltimaAsistencia(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const asistencia = await AsistenciaDAO.obtenerUltimaAsistencia(alumnoId, parseInt(cursoId));

      if (!asistencia) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró asistencia reciente'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          asistencia: {
            id: asistencia.id,
            fechaHora: asistencia.fechaHora,
            materia: asistencia.curso.materia.nombre,
            salon: `Edificio ${asistencia.curso.salon.edificio} - Aula ${asistencia.curso.salon.aula}`,
            estado: asistencia.estado
          }
        }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener confirmación'
      });
    }
  }

  /**
   * GET /api/asistencia/obtenerPorAlumnoCurso/:cursoId
   * Obtener todas las asistencias de un alumno en un curso
   * MISMO NOMBRE QUE DAO: obtenerPorAlumnoCurso()
   */
  async obtenerPorAlumnoCurso(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const asistencias = await AsistenciaDAO.obtenerPorAlumnoCurso(alumnoId, parseInt(cursoId));

      return res.status(200).json({
        success: true,
        data: { asistencias }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener asistencias'
      });
    }
  }
}

module.exports = new AsistenciaController();
