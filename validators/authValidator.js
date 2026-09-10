const { check } = require('express-validator');

const registerValidator = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role').optional().isIn(['student', 'instructor']).withMessage('Invalid role specified. Admin registration is not allowed publicly.')
];

const loginValidator = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

module.exports = { registerValidator, loginValidator };
