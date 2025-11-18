const express = require("express");
const usuarioController = require("../controllers/UsuarioController.js");
const validateJWT = require("../middleware/validateJWT");
const router = express.Router();

// HU01.1 - Iniciar Sesión
router.post("/login", usuarioController.autenticar);

// HU01.2 - Cerrar Sesión
router.post("/logout", validateJWT, usuarioController.logout);

// Verificar si usuario existe (usado en validaciones)
router.get("/existe/:id", usuarioController.existe);
module.exports = router;
