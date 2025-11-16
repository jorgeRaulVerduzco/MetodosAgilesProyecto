const { Usuario, Alumno, Maestro } = require('../models');

class UsuarioDAO {
  /**
   * Autenticar usuario por ID y contraseña
   * @param {string} id - ID del usuario (ITSON)
   * @param {string} contrasenia - Contraseña del usuario
   * @returns {Object|null} Usuario con su perfil (alumno o maestro)
   */
  async autenticar(id, contrasenia) {
    try {
      const usuario = await Usuario.findOne({
        where: { id, contrasenia }
      });

      if (!usuario) {
        return null; // Usuario no encontrado o credenciales incorrectas
      }

      return usuario;
    } catch (error) {
      console.error('Error en autenticar:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario con su perfil completo (alumno o maestro)
   * @param {string} id - ID del usuario
   * @returns {Object|null} Usuario con perfil
   */
  async obtenerPorIdConPerfil(id) {
    try {
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return null;
      }

      // Incluir perfil según tipo de usuario
      if (usuario.tipoUsuario === 'alumno') {
        return await Usuario.findByPk(id, {
          include: [{
            model: Alumno,
            as: 'perfilAlumno'
          }]
        });
      } else if (usuario.tipoUsuario === 'maestro') {
        return await Usuario.findByPk(id, {
          include: [{
            model: Maestro,
            as: 'perfilMaestro'
          }]
        });
      }

      return usuario;
    } catch (error) {
      console.error('Error en obtenerPorIdConPerfil:', error);
      throw error;
    }
  }

  /**
   * Verificar si existe un usuario
   * @param {string} id - ID del usuario
   * @returns {boolean}
   */
  async existe(id) {
    try {
      const count = await Usuario.count({ where: { id } });
      return count > 0;
    } catch (error) {
      console.error('Error en existe:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario con su perfil
   * @param {Object} data - Datos del usuario
   * @returns {Object} Usuario creado
   */
  async crear(data) {
    const transaction = await Usuario.sequelize.transaction();
    
    try {
      // 1. Crear usuario
      const usuario = await Usuario.create({
        id: data.id,
        nombres: data.nombres,
        apellidos: data.apellidos,
        tipoUsuario: data.tipoUsuario,
        contrasenia: data.contrasenia
      }, { transaction });

      // 2. Crear perfil según tipo
      if (data.tipoUsuario === 'alumno') {
        await Alumno.create({ id: usuario.id }, { transaction });
      } else if (data.tipoUsuario === 'maestro') {
        await Maestro.create({ id: usuario.id }, { transaction });
      }

      await transaction.commit();
      return usuario;
    } catch (error) {
      await transaction.rollback();
      console.error('Error en crear:', error);
      throw error;
    }
  }
}

module.exports = new UsuarioDAO();