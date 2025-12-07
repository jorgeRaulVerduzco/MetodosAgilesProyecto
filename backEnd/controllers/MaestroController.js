// controllers/MaestroController.js
const maestroDAO = require("../daos/MaestroDAO");
const { Asistencia } = require("../models");

class MaestroController {
  // GET /maestros/:maestroId/cursos?periodo=...
  async getCursos(req, res) {
    try {
      const { maestroId } = req.params;
      const { periodo } = req.query;

      if (!maestroId) {
        return res.status(400).json({
          success: false,
          message: "maestroId requerido",
        });
      }

      const cursos = await maestroDAO.obtenerCursos(maestroId, periodo || null);

      // Escenario 2: Maestro sin cursos
      if (!cursos || cursos.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No tienes cursos asignados en este periodo",
          data: [],
        });
      }

      // Escenario 1: Maestro con cursos activos
      return res.status(200).json({
        success: true,
        data: cursos,
      });
    } catch (error) {
      console.error("getCursos:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  // GET /maestros/:maestroId/cursos/:cursoId/asistencias?fechaInicio=yyyy-mm-dd&fechaFin=yyyy-mm-dd
  async getAsistenciasPorCurso(req, res) {
    try {
      const { maestroId, cursoId } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      if (!maestroId || !cursoId) return res.status(400).json({ error: "maestroId y cursoId requeridos" });

      // Verificar que el curso pertenece al maestro
      const pertenece = await maestroDAO.verificarCursoMaestro(cursoId, maestroId);
      if (!pertenece) return res.status(403).json({ error: "No autorizado para ver este curso" });

      // Parseo de fechas opcional
      const filtros = {};
      if (fechaInicio && fechaFin) {
        const fi = new Date(fechaInicio);
        const ff = new Date(fechaFin);
        if (isNaN(fi.getTime()) || isNaN(ff.getTime()))
          return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
        filtros.fechaInicio = fi;
        // incluir final del día
        filtros.fechaFin = new Date(ff.setHours(23, 59, 59, 999));
      }

      const lista = await maestroDAO.obtenerAsistenciasPorCurso(Number(cursoId), filtros);

      // Según EP06: si no hay asistencias mostrar mensaje específico
      if (!lista || lista.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Aún no hay asistencias registradas para este curso",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        data: lista,
      });
    } catch (error) {
      console.error("getAsistenciasPorCurso:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // GET /maestros/:maestroId/cursos/:cursoId/alumnos/:alumnoId/detalle
  async getDetalleAsistenciaAlumno(req, res) {
    try {
      const { maestroId, cursoId, alumnoId } = req.params;
      if (!maestroId || !cursoId || !alumnoId)
        return res.status(400).json({ error: "maestroId, cursoId y alumnoId requeridos" });

      const pertenece = await maestroDAO.verificarCursoMaestro(cursoId, maestroId);
      if (!pertenece) return res.status(403).json({ error: "No autorizado para ver este curso" });

      const detalle = await maestroDAO.obtenerDetalleAsistenciaAlumno(Number(cursoId), alumnoId);
      if (!detalle) return res.status(404).json({ error: "Alumno o asistencias no encontradas" });

      return res.json({ data: detalle });
    } catch (error) {
      console.error("getDetalleAsistenciaAlumno:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // POST /maestros/:maestroId/cursos/:cursoId/alumnos/:alumnoId/asistencias  (crear manual)
  async crearAsistenciaManual(req, res) {
    try {
      const { maestroId, cursoId, alumnoId } = req.params;
      const { fechaHora, estado } = req.body;

      if (!maestroId || !cursoId || !alumnoId) return res.status(400).json({ error: "Parámetros faltantes" });

      const pertenece = await maestroDAO.verificarCursoMaestro(cursoId, maestroId);
      if (!pertenece) return res.status(403).json({ error: "No autorizado para este curso" });

      const datos = {
        alumnoId,
        cursoId: Number(cursoId),
        fechaHora,
        estado,
      };

      const asistencia = await maestroDAO.crearAsistenciaManual(datos);
      return res.status(201).json({
        success: true,
        message: "Asistencia registrada exitosamente",
        data: asistencia,
      });
    } catch (error) {
      console.error("crearAsistenciaManual:", error);
      // errores esperados desde DAO -> 400
      return res.status(400).json({ error: error.message || "Error al crear asistencia" });
    }
  }

  // PUT /maestros/:maestroId/asistencias/:asistenciaId  (modificar estado)
  async modificarAsistencia(req, res) {
    try {
      const { maestroId, asistenciaId } = req.params;
      const { nuevoEstado } = req.body;

      if (!maestroId || !asistenciaId || !nuevoEstado)
        return res.status(400).json({ 
          success: false,
          error: "Parámetros faltantes" 
        });

      // buscar asistencia para obtener cursoId y verificar propiedad
      const asistencia = await Asistencia.findByPk(asistenciaId);
      if (!asistencia) return res.status(404).json({ 
        success: false,
        error: "Asistencia no encontrada" 
      });

      const pertenece = await maestroDAO.verificarCursoMaestro(asistencia.cursoId, maestroId);
      if (!pertenece) return res.status(403).json({ 
        success: false,
        error: "No autorizado para modificar esta asistencia" 
      });

      const updated = await maestroDAO.modificarAsistencia(Number(asistenciaId), nuevoEstado);
      return res.status(200).json({
        success: true,
        message: "Asistencia actualizada exitosamente",
        data: updated,
      });
    } catch (error) {
      console.error("modificarAsistencia:", error);
      return res.status(400).json({ 
        success: false,
        error: error.message || "Error al modificar asistencia" 
      });
    }
  }

  // GET /maestros/:maestroId/cursos/:cursoId/alumnos/:alumnoId/asistencias
  async getAsistenciasAlumno(req, res) {
    try {
      const { maestroId, cursoId, alumnoId } = req.params;

      if (!maestroId || !cursoId || !alumnoId)
        return res.status(400).json({ 
          success: false,
          error: "Parámetros faltantes" 
        });

      const pertenece = await maestroDAO.verificarCursoMaestro(cursoId, maestroId);
      if (!pertenece) return res.status(403).json({ 
        success: false,
        error: "No autorizado para ver este curso" 
      });

      const detalle = await maestroDAO.obtenerDetalleAsistenciaAlumno(Number(cursoId), alumnoId);
      if (!detalle) return res.status(404).json({ 
        success: false,
        error: "Alumno o asistencias no encontradas" 
      });

      return res.status(200).json({
        success: true,
        data: detalle,
      });
    } catch (error) {
      console.error("getAsistenciasAlumno:", error);
      return res.status(500).json({ 
        success: false,
        error: "Error interno del servidor" 
      });
    }
  }
}

module.exports = new MaestroController();
