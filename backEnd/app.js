const path = require('path');
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOG TEMPORAL - Para ver qué requests llegan
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});
app.use(express.static(path.join(__dirname, 'frontEnd')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontEnd', 'index.html'));
});
// Ruta de prueba ANTES de los routers
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date(),
  });
});

// Importar rutas
const usuarioRoutes = require("./routes/UsuarioRoutes.js");
const alumnoRoutes = require("./routes/AlumnoRoutes.js");
const asistenciaRoutes = require("./routes/AsistenciaRoutes.js");
const cursoRoutes = require("./routes/CursoRoutes.js");
const maestroRouter = require("./routes/MaestroRoutes.js");

// Configurar rutas
app.use("/api", usuarioRoutes);
app.use("/api/alumno", alumnoRoutes);
app.use("/api/asistencia", asistenciaRoutes);
app.use("/api/curso", cursoRoutes);
app.use("/api/maestro", maestroRouter);

// Manejo de errores 404 - DEBE IR AL FINAL
app.use((req, res, next) => {
  // Solo manejar rutas que empiecen con /api
  if (req.url.startsWith('/api')) {
    console.log(`❌ 404 - Ruta API no encontrada: ${req.method} ${req.url}`);
    return res.status(404).json({
      success: false,
      message: "Ruta API no encontrada",
      ruta: req.url
    });
  }
  // Si no es API, dejar pasar (archivos estáticos)
  next();
});
// Manejo de errores global
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;