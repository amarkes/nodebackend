module.exports = (sequelize, DataTypes) => {
    const Discount = sequelize.define('Discount', {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      discountType: {
        type: DataTypes.ENUM('percent', 'fixed'),
        allowNull: false
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      applicableTo: {
        type: DataTypes.STRING, // Exemplo: "faixa salarial", "classe"
        allowNull: true
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      progressive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      minValue: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      maxValue: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      baseCalculation: {
        type: DataTypes.ENUM('bruto', 'liquido', 'outros'),
        allowNull: false
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    });
  
    return Discount;
  };
  