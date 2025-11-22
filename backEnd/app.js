const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const usuarioRoutes = require("./routes/UsuarioRoutes.js");
const alumnoRoutes = require("./routes/AlumnoRoutes.js");
const asistenciaRoutes = require("./routes/AsistenciaRoutes.js");
const cursoRoutes = require("./routes/CursoRoutes.js");
const maestroRouter = require("./routes/MaestroRoutes.js");

// Configurar rutas
app.use("/api/usuario", usuarioRoutes);
app.use("/api/alumno", alumnoRoutes);
app.use("/api/asistencia", asistenciaRoutes);
app.use("/api/curso", cursoRoutes);
app.use("/api", maestroRouter);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date(),
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
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