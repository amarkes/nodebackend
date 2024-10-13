'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,  // Permitir que a coluna seja nula
      unique: true      // Continuar exigindo que o valor seja único, se fornecido
    });
  },

  down: async (queryInterface, Sequelize) => {
    // No rollback (down), voltamos o campo para não permitir valores nulos
    return queryInterface.changeColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: false,  // Não permitir null novamente
      unique: true
    });
  }
};
