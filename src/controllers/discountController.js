const { Discount } = require('../../models');

exports.getAllDiscounts = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query; // Parâmetros de paginação
    const offset = (page - 1) * limit; // Calcula o deslocamento com base na página atual
    const { rows: discounts, count } = await Discount.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    // Calcula se há uma próxima página
    const hasNextPage = offset + discounts.length < count;
    res.formatList(discounts, count, parseInt(page), Math.ceil(count / limit), hasNextPage);
  } catch (err) {
    next(err);
  }
};

exports.createDiscount = async (req, res, next) => {
  try {
    const {
      title,
      description,
      discountType,
      value,
      applicableTo,
      startDate,
      endDate,
      progressive,
      minValue,
      maxValue,
      baseCalculation,
      priority,
    } = req.body;
    const discount = await Discount.create({
      title,
      description,
      discountType,
      value,
      applicableTo,
      startDate,
      endDate,
      progressive,
      minValue,
      maxValue,
      baseCalculation,
      priority,
    });
    const successResponse = {
      statusCode: 201,
      message: 'Operation completed successfully',
      data: discount
    };
    next(successResponse);
  } catch (err) {
    next(err);
  }
};

exports.updateDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByPk(id);
    if (!discount) {
      const error = {
        statusCode: 404,
        errors: [{user: 'Discount not found'}]
      }
      next(error);
      return;
    }

    const {
      title,
      description,
      discountType,
      value,
      applicableTo,
      startDate,
      endDate,
      progressive,
      minValue,
      maxValue,
      baseCalculation,
      priority,
    } = req.body;
    await discount.update({title,
      description,
      discountType,
      value,
      applicableTo,
      startDate,
      endDate,
      progressive,
      minValue,
      maxValue,
      baseCalculation,
      priority,});
      const successResponse = {
        statusCode: 200,
        message: 'Operation completed successfully',
        data: discount
      };
      next(successResponse)
  } catch (err) {
    next(err);
  }
};

exports.deleteDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByPk(id);
    if (!discount) {
      const error = {
        statusCode: 404,
        errors: [{user: 'Discount not found'}]
      }
      next(error);
      return;
    }

    await discount.destroy();
    const successResponse = {
      statusCode: 204,
      message: 'Discount deleted successful.',
    };
    next(successResponse)
  } catch (err) {
    next(err);
  }
};
