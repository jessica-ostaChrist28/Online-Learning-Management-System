const { param } = require('express-validator');

// Validate that both courseId and lessonId are valid MongoDB ObjectIds
const validateProgressParams = [
  param('courseId')
    .isMongoId()
    .withMessage('Invalid courseId'),
  param('lessonId')
    .isMongoId()
    .withMessage('Invalid lessonId')
];

module.exports = { validateProgressParams };
