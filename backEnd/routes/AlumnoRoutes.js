const express = require('express');
const alumnoController = require('../controllers/AlumnoController.js');
const validateJWT = require('../middleware/validateJWT.js');
const router = express.Router();

// Todas las rutas de alumno requieren autenticación
router.use(validateJWT);

// HU02.1 - Ver horario de clases
router.get('/horario/:periodo', alumnoController.obtenerHorario);

// HU03.1 - Obtener clases de hoy
router.get('/clases-hoy', alumnoController.obtenerClasesHoy);

// HU04.1 - Obtener historial general de asistencias
router.get('/historial-asistencias', alumnoController.obtenerHistorialAsistencias);

// HU04.2 - Obtener detalle de asistencias por curso (NUEVA RUTA)
router.get('/asistencias/curso/:cursoId', alumnoController.obtenerAsistenciasPorCurso);

// Verificar si está inscrito en el curso
router.get('/inscrito/:cursoId', alumnoController.estaInscritoEnCurso);

module.exports = router;