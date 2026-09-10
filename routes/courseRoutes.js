const express = require('express');
const router = express.Router();
const {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  getPublicCourses
} = require('../controllers/courseController');
const { createCourseValidator, updateCourseValidator } = require('../validators/courseValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getPublicCourses);

// Protected routes (Instructor only)
router.use(protect);
router.use(requireRole('instructor'));

router.post('/', createCourseValidator, validate, createCourse);
router.get('/mine', getInstructorCourses);
router.put('/:id', updateCourseValidator, validate, updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
