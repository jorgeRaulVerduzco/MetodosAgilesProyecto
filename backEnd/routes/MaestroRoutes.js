// routes/MaestroRoutes.js
const express = require("express");
const maestroController = require("../controllers/MaestroController");
const validateJWT = require("../middleware/validateJWT");
const router = express.Router();


// 👇 ESTA LÍNEA ES CRÍTICA

// Obtener cursos del maestro
router.get("/maestros/:maestroId/cursos", (req, res) => 
  maestroController.getCursos(req, res)
);

// Obtener asistencias por curso con filtro de fechas
router.get(
  "/maestros/:maestroId/cursos/:cursoId/asistencias",
  (req, res) => maestroController.getAsistenciasPorCurso(req, res)
);

// Ver detalle de un alumno en un curso
router.get(
  "/maestros/:maestroId/cursos/:cursoId/alumnos/:alumnoId/detalle",
  (req, res) => maestroController.getDetalleAsistenciaAlumno(req, res)
);

// Crear asistencia manual (verificación/registro)
router.post(
  "/maestros/:maestroId/cursos/:cursoId/alumnos/:alumnoId/asistencias",
  (req, res) => maestroController.crearAsistenciaManual(req, res)
);

// Modificar asistencia (por id)
router.put(
  "/maestros/:maestroId/asistencias/:asistenciaId",
  (req, res) => maestroController.modificarAsistencia(req, res)
);

module.exports = router;