const { check } = require('express-validator');
const mongoose = require('mongoose');

// Helper to validate Mongo ObjectId strings
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createModuleValidator = [
  // courseId is taken from params, not body, but we may still validate if present in body (ignore)
  check('title')
    .notEmpty().withMessage('Module title is required')
    .bail()
    .isString().withMessage('Title must be a string')
    .trim(),
  check('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  check('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non‑negative integer')
    .toInt()
];

const updateModuleValidator = [
  check('title')
    .optional()
    .notEmpty().withMessage('Title cannot be empty')
    .isString().withMessage('Title must be a string')
    .trim(),
  check('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  check('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non‑negative integer')
    .toInt()
];

module.exports = {
  createModuleValidator,
  updateModuleValidator
};
