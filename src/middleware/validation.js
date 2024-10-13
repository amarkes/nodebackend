const { check } = require('express-validator');

exports.registerValidation = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 4 }).withMessage('Password must be at least 6 characters long'),
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('document').optional().isString().withMessage('Document must be a valid string'),
  check('mobile').optional().isMobilePhone().withMessage('Mobile number must be valid'),
  check('phone').optional().isString().withMessage('Phone number must be valid'),
  check('gender').optional().isIn(['M', 'F', 'U']).withMessage('Gender must be M, F, or U'),
  check('birth').optional().isDate().withMessage('Birth must be a valid date'),
];
exports.updateValidation = [
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('document').optional().isString().withMessage('Document must be a valid string'),
  check('mobile').optional().isMobilePhone().withMessage('Mobile number must be valid'),
  check('phone').optional().isString().withMessage('Phone number must be valid'),
  check('gender').optional().isIn(['M', 'F', 'U']).withMessage('Gender must be M, F, or U'),
  check('birth').optional().isDate().withMessage('Birth must be a valid date'),
];
