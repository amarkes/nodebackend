'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Discounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      discountType: {
        type: Sequelize.ENUM('percent', 'fixed'),
        allowNull: false
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      applicableTo: {
        type: Sequelize.STRING, // Exemplo: "faixa salarial", "classe"
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      progressive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      minValue: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      maxValue: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      baseCalculation: {
        type: Sequelize.ENUM('bruto', 'liquido', 'outros'),
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Discounts');
  }
};
