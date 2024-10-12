// src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { jwtSecret } = require('../../src/config');

const auth = async (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
   if (!token) {
    return res.status(401).json({
      message: 'Access Denied! Not token.'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret); // Use a variável de ambiente para o segredo
    req.user = decoded;
    const user = await User.findByPk(req.user._id);
    if (!user) {
      return res.status(401).json({
        message: 'Access Denied! Not User.'
      });
    }

    req.user.isStaff = user.isStaff;
    next();
  } catch (err) {
    res.status(401).json({
      message: 'Access Denied'
    });
  }
};

module.exports = auth;
