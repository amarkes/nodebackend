'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Discounts', 'timeValue', {
      type: Sequelize.FLOAT,
      allowNull: true, // Você pode alterar isso para `false` se for obrigatório
      defaultValue: null, // Você pode definir um valor padrão se necessário
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Discounts', 'timeValue');
  }
};
