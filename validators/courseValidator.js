const { check } = require('express-validator');

const createCourseValidator = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('level', 'Level is required').isIn(['Beginner', 'Intermediate', 'Advanced'])
];

const updateCourseValidator = [
  check('title', 'Title cannot be empty').optional().not().isEmpty(),
  check('description', 'Description cannot be empty').optional().not().isEmpty(),
  check('category', 'Category cannot be empty').optional().not().isEmpty(),
  check('level', 'Invalid level').optional().isIn(['Beginner', 'Intermediate', 'Advanced'])
];

module.exports = { createCourseValidator, updateCourseValidator };
