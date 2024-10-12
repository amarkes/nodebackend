const { Discount } = require('../../models');

exports.getAllDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.findAll();
    res.status(200).json(discounts);
  } catch (err) {
    next(err);
  }
};

exports.createDiscount = async (req, res, next) => {
  try {
    const { title, description, type, value } = req.body;
    const discount = await Discount.create({ title, description, type, value });
    res.status(201).json(discount);
  } catch (err) {
    next(err);
  }
};

exports.updateDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    const { title, description, type, value } = req.body;
    await discount.update({ title, description, type, value });
    res.status(200).json(discount);
  } catch (err) {
    next(err);
  }
};

exports.deleteDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    await discount.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
