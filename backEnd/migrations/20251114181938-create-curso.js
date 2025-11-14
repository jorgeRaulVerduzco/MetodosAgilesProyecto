'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cursos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      grupo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      periodo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      numeroAlumnos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      horarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Horarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      salonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Salones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      maestroId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Maestros',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Cursos');
  }
};
