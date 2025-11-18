const UsuarioDAO = require("../daos/UsuarioDAO");

class UsuarioController {
  async autenticar(req, res) {
    try {
      const { id, contrasenia } = req.body;

      if (!id || !contrasenia) {
        return res.status(400).json({
          success: false,
          message: "ID y contraseña son requeridos",
        });
      }

      // Escenario 4: Usuario inexistente
      const existe = await UsuarioDAO.existe(id);
      if (!existe) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Escenario 3: Credenciales incorrectas
      const usuario = await UsuarioDAO.autenticar(id, contrasenia);
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        });
      }

      // Escenario 1 y 2: Login exitoso
      const token = Buffer.from(`${usuario.id}:${Date.now()}`).toString(
        "base64"
      );

      return res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          usuario: {
            id: usuario.id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            tipoUsuario: usuario.tipoUsuario,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error en autenticar:", error);
      return res.status(500).json({
        success: false,
        message: "Error al iniciar sesión",
      });
    }
  }

  async logout(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al cerrar sesión",
      });
    }
  }

  async existe(req, res) {
    try {
      const { id } = req.params;
      const existe = await UsuarioDAO.existe(id);

      return res.status(200).json({
        success: true,
        data: { existe },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al verificar usuario",
      });
    }
  }
}

module.exports = new UsuarioController();
