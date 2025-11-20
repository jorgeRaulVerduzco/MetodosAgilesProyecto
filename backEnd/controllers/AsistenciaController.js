const AsistenciaDAO = require('../daos/AsistenciaDAO');
const AlumnoDAO = require('../daos/AlumnoDAO');
const CursoDAO = require('../daos/CursoDAO');

class AsistenciaController {
  /**
   * POST /api/asistencia
   * HU03.1 - Registrar asistencia a clase
   * Solo se ejecuta cuando el usuario PRESIONA EL BOTÓN
   */
  async crear(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId, ubicacionLat, ubicacionLong } = req.body;

      console.log('=== INTENTANDO REGISTRAR ASISTENCIA ===');
      console.log('AlumnoId:', alumnoId);
      console.log('CursoId:', cursoId);

      if (!cursoId) {
        return res.status(400).json({
          success: false,
          message: 'El ID del curso es requerido'
        });
      }

      // 1. Verificar inscripción
      const estaInscrito = await AlumnoDAO.estaInscritoEnCurso(alumnoId, cursoId);
      if (!estaInscrito) {
        return res.status(403).json({
          success: false,
          message: 'No estás inscrito en este curso'
        });
      }

      // 2. Verificar que NO haya registrado ya HOY
      const yaRegistro = await AsistenciaDAO.existeAsistenciaHoy(alumnoId, cursoId);
      console.log('¿Ya registró hoy?:', yaRegistro);
      
      if (yaRegistro) {
        return res.status(400).json({
          success: false,
          message: 'Ya registraste tu asistencia para esta clase hoy'
        });
      }

      // 3. Obtener información del curso
      const curso = await CursoDAO.obtenerPorId(cursoId);
      if (!curso) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      // 4. Validar DÍA de la semana
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const ahora = new Date();
      const diaActual = diasSemana[ahora.getDay()];
      const diaClase = curso.horario.dia;

      console.log('Día actual:', diaActual);
      console.log('Día de la clase:', diaClase);

      if (diaActual !== diaClase) {
        return res.status(400).json({
          success: false,
          message: `Esta clase es los días ${diaClase}, hoy es ${diaActual}`
        });
      }

      // 5. Validar HORARIO (con margen de ±15 minutos)
      const [horaInicioH, horaInicioM] = curso.horario.horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = curso.horario.horaFin.split(':').map(Number);
      
      const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
      const horaInicio = horaInicioH * 60 + horaInicioM;
      const horaFin = horaFinH * 60 + horaFinM;
      
      const margen = 15;
      const dentroDeHorario = (horaActual >= horaInicio - margen) && (horaActual <= horaFin + margen);

      console.log('Hora actual (minutos):', horaActual);
      console.log('Rango permitido:', `${horaInicio - margen} - ${horaFin + margen}`);
      console.log('¿Dentro de horario?:', dentroDeHorario);

      if (!dentroDeHorario) {
        return res.status(400).json({
          success: false,
          message: `Fuera del horario de clase (${curso.horario.horaInicio} - ${curso.horario.horaFin})`
        });
      }

      // 6. REGISTRAR ASISTENCIA (ubicación no se valida, siempre true)
      console.log('✓ Todas las validaciones pasaron, registrando asistencia...');
      
      const asistencia = await AsistenciaDAO.crear({
        alumnoId,
        cursoId,
        fechaHora: new Date(),
        estado: 'presente',
        ubicacionLat: ubicacionLat || curso.salon.ubicacionLat,
        ubicacionLong: ubicacionLong || curso.salon.ubicacionLong,
        validada: true
      });

      console.log('✓ Asistencia registrada con ID:', asistencia.id);

      // 7. Obtener confirmación completa
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
            hora: ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          }
        }
      });

    } catch (error) {
      console.error('❌ Error en crear asistencia:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al registrar asistencia'
      });
    }
  }

  /**
   * GET /api/asistencia/existe-hoy/:cursoId
   * Verificar si YA registró asistencia HOY
   * Se ejecuta al cargar la página para mostrar/ocultar el botón
   */
  async existeAsistenciaHoy(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      console.log('=== VERIFICANDO SI YA REGISTRÓ HOY ===');
      console.log('AlumnoId:', alumnoId);
      console.log('CursoId:', cursoId);

      const existe = await AsistenciaDAO.existeAsistenciaHoy(
        alumnoId, 
        parseInt(cursoId)
      );

      console.log('Resultado: existe =', existe);

      // IMPORTANTE: Siempre retornar un booleano claro
      return res.status(200).json({
        success: true,
        existe: Boolean(existe)  // Forzar a booleano
      });

    } catch (error) {
      console.error('❌ Error verificando asistencia:', error);
      // En caso de error, asumir que NO existe para no bloquear al usuario
      return res.status(200).json({
        success: true,
        existe: false
      });
    }
  }

  /**
   * GET /api/asistencia/ultima/:cursoId
   * HU03.2 - Ver confirmación de última asistencia
   */
  async obtenerUltimaAsistencia(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const asistencia = await AsistenciaDAO.obtenerUltimaAsistencia(
        alumnoId, 
        parseInt(cursoId)
      );

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
      console.error('❌ Error al obtener última asistencia:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener confirmación'
      });
    }
  }

  /**
   * GET /api/asistencia/curso/:cursoId
   * Obtener todas las asistencias de un alumno en un curso
   */
  async obtenerPorAlumnoCurso(req, res) {
    try {
      const alumnoId = req.userId;
      const { cursoId } = req.params;

      const asistencias = await AsistenciaDAO.obtenerPorAlumnoCurso(
        alumnoId, 
        parseInt(cursoId)
      );

      return res.status(200).json({
        success: true,
        data: { asistencias }
      });

    } catch (error) {
      console.error('❌ Error al obtener asistencias:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener asistencias'
      });
    }
  }
}

module.exports = new AsistenciaController();