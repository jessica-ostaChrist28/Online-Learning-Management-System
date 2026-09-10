const { param } = require('express-validator');

// Validate that the courseId URL param is a valid MongoDB ObjectId
const enrollmentValidator = [
  param('courseId')
    .isMongoId()
    .withMessage('Invalid courseId')
];

module.exports = { enrollmentValidator };
