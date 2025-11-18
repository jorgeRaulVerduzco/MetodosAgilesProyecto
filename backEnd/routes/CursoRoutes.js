const express = require('express');
const cursoController = require('../controllers/CursoController.js');
const validateJWT = require('../middleware/validateJWT');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(validateJWT);

// Obtener información de un curso
router.get('/:id', cursoController.obtenerPorId);

// HU06.1 - Consultar asistencias por curso 
router.get('/:cursoId/asistencias', cursoController.obtenerAsistenciasConEstadisticas);

// Obtener alumnos de un curso
router.get('/:cursoId/alumnos', cursoController.obtenerAlumnos);

// Verificar si curso existe
router.get('/existe/:id', cursoController.existe);

module.exports = router;