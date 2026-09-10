const { check } = require('express-validator');
const mongoose = require('mongoose');

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createLessonValidator = [
  check('title')
    .notEmpty().withMessage('Lesson title is required')
    .bail()
    .isString().withMessage('Title must be a string')
    .trim(),
  check('content')
    .optional()
    .isString().withMessage('Content must be a string')
    .trim(),
  check('videoUrl')
    .optional()
    .isString().withMessage('Video URL must be a string')
    .trim(),
  check('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non‑negative integer')
    .toInt()
];

const updateLessonValidator = [
  check('title')
    .optional()
    .notEmpty().withMessage('Title cannot be empty')
    .isString().withMessage('Title must be a string')
    .trim(),
  check('content')
    .optional()
    .isString().withMessage('Content must be a string')
    .trim(),
  check('videoUrl')
    .optional()
    .isString().withMessage('Video URL must be a string')
    .trim(),
  check('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order must be a non‑negative integer')
    .toInt()
];

module.exports = {
  createLessonValidator,
  updateLessonValidator
};
