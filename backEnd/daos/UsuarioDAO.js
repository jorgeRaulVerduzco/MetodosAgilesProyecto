const { Usuario, Alumno, Maestro } = require('../models');

class UsuarioDAO {
  /**
   * CREAR usuario con perfil (pa simulaar ese del sistema ITSON)
   */
  async crear(data) {
    const transaction = await Usuario.sequelize.transaction();
    try {
      const usuario = await Usuario.create({
        id: data.id,
        nombres: data.nombres,
        apellidos: data.apellidos,
        tipoUsuario: data.tipoUsuario,
        contrasenia: data.contrasenia
      }, { transaction });

      if (data.tipoUsuario === 'alumno') {
        await Alumno.create({ id: usuario.id }, { transaction });
      } else if (data.tipoUsuario === 'maestro') {
        await Maestro.create({ id: usuario.id }, { transaction });
      }

      await transaction.commit();
      return usuario;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * AUTENTICAR usuario muy basico xd
   */
  async autenticar(id, contrasenia) {
    try {
      return await Usuario.findOne({
        where: { id, contrasenia }
      });
    } catch (error) {
      throw error;
    }
  }

  
  async existe(id) {
    try {
      const count = await Usuario.count({ where: { id } });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UsuarioDAO();