// src/middleware/errorHandler.js

const { ValidationError, UniqueConstraintError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  console.log(statusCode)

  if (err instanceof UniqueConstraintError) {
    res.status(400).json({
      message: 'Username or email already exists'
    });
  } else if (err instanceof ValidationError) {
    res.status(400).json({
      message: 'Validation error',
      details: err.errors.map(e => e.message)
    });
  } else if (statusCode === 401) {
    res.status(401).json({
      message: 'Access Denied'
    });
  } else {
    res.status(statusCode).json({
      message: err.message
    });
  }
};

module.exports = errorHandler;
