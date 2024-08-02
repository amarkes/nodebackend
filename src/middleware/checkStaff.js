// src/middleware/checkStaff.js

const { User } = require('../../models'); // Corrigido o caminho

const checkStaff = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user._id);
    if (user && user.isStaff) {
      next();
    } else {
      res.status(403);
      throw new Error('Access denied: Not a staff member');
    }
  } catch (err) {
    next(err);
  }
};

module.exports = checkStaff;
