const express = require('express');
const asistenciaController = require('../controllers/AsistenciaController.js');
const validateJWT = require('../middleware/validateJWT');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(validateJWT);

// HU03.1 - Registrar asistencia a clase
router.post('/', asistenciaController.crear);

// HU03.2 - Ver confirmación de asistencia registrada
router.get('/ultima/:cursoId', asistenciaController.obtenerUltimaAsistencia);

// Verificar si ya registró asistencia hoy
router.get('/existe-hoy/:cursoId', asistenciaController.existeAsistenciaHoy);

// Obtener todas las asistencias de un alumno en un curso
router.get('/curso/:cursoId', asistenciaController.obtenerPorAlumnoCurso);

module.exports = router;
