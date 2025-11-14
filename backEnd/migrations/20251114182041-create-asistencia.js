'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Asistencias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fechaHora: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      estado: {
        type: Sequelize.ENUM('presente', 'ausente', 'justificado'),
        allowNull: false,
        defaultValue: 'presente'
      },
      ubicacionLat: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      ubicacionLong: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      validada: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      alumnoId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Alumnos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cursoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Cursos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Asistencias', ['alumnoId'], {
      name: 'asistencias_alumno_id'
    });

    await queryInterface.addIndex('Asistencias', ['cursoId'], {
      name: 'asistencias_curso_id'
    });

    await queryInterface.addIndex('Asistencias', ['fechaHora'], {
      name: 'asistencias_fecha_hora'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Asistencias');
  }
};