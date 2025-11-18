const CursoDAO = require('../daos/CursoDAO');

class CursoController {
  
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const curso = await CursoDAO.obtenerPorId(parseInt(id));

      if (!curso) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: { curso }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener curso'
      });
    }
  }


  async obtenerAlumnos(req, res) {
    try {
      const { cursoId } = req.params;
      const alumnos = await CursoDAO.obtenerAlumnos(parseInt(cursoId));

      return res.status(200).json({
        success: true,
        data: { alumnos }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener alumnos'
      });
    }
  }

  async obtenerAsistenciasConEstadisticas(req, res) {
    try {
      const { cursoId } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      const filtros = {};
      if (fechaInicio && fechaFin) {
        filtros.fechaInicio = new Date(fechaInicio);
        filtros.fechaFin = new Date(fechaFin);
      }

      const estadisticas = await CursoDAO.obtenerAsistenciasConEstadisticas(parseInt(cursoId), filtros);

      // Escenario 4: Sin asistencias
      if (estadisticas.length === 0 || estadisticas.every(a => a.asistencias.length === 0)) {
        return res.status(200).json({
          success: true,
          message: 'Aún no hay asistencias registradas para este curso',
          data: { asistencias: [] }
        });
      }

      // Escenario 2: Clasificar por nivel de asistencia
      const asistenciasConNivel = estadisticas.map(alumno => {
        let nivelAsistencia = 'normal'; // verde
        
        if (alumno.porcentajeAsistencia < 70) {
          nivelAsistencia = 'critico'; // rojo
        } else if (alumno.porcentajeAsistencia < 85) {
          nivelAsistencia = 'alerta'; // naranja
        }

        return {
          id: alumno.id,
          nombres: alumno.nombres,
          apellidos: alumno.apellidos,
          nombreCompleto: alumno.nombreCompleto,
          totalAsistencias: alumno.totalAsistencias,
          totalFaltas: alumno.totalFaltas,
          porcentajeAsistencia: alumno.porcentajeAsistencia,
          nivelAsistencia
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Asistencias obtenidas exitosamente',
        data: { asistencias: asistenciasConNivel }
      });

    } catch (error) {
      console.error('Error en obtenerAsistenciasConEstadisticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al consultar asistencias'
      });
    }
  }


  async existe(req, res) {
    try {
      const { id } = req.params;
      const existe = await CursoDAO.existe(parseInt(id));

      return res.status(200).json({
        success: true,
        data: { existe }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar curso'
      });
    }
  }
}

module.exports = new CursoController();

