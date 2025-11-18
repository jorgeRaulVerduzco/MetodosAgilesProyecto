const express = require('express');
const alumnoController = require('../controllers/AlumnoController.js');
const validateJWT = require('../middleware/validateJWT.js');
const router = express.Router();

// Todas las rutas de alumno requieren autenticación
router.use(validateJWT);

// HU02.1 - Ver horario de clases
router.get('/horario/:periodo', alumnoController.obtenerHorario);

// HU03.1 - Obtener clases de hoy (CLAVE SPRINT 1)
router.get('/clases-hoy', alumnoController.obtenerClasesHoy);

// HU04.1 - Consultar historial de asistencias por curso
router.get('/historial-asistencias', alumnoController.obtenerHistorialAsistencias); // <-- ESTA LÍNEA

// Verificar inscripción en curso (validación)
router.get('/inscrito/:cursoId', alumnoController.estaInscritoEnCurso);

module.exports = router;