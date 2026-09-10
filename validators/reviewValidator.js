// validators/reviewValidator.js
const { check } = require('express-validator');

const createReviewValidator = [
  check('courseId', 'Valid courseId is required').isMongoId(),
  check('rating', 'Rating must be an integer between 1 and 5')
    .isInt({ min: 1, max: 5 })
    .toInt(),
  check('comment').optional().isString().trim()
];

module.exports = { createReviewValidator };
