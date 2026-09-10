const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const { enrollInCourse, getMyEnrollments } = require('../controllers/enrollmentController');
const { enrollmentValidator } = require('../validators/enrollmentValidator');

// Enroll in a course (student only)
router.post(
  '/courses/:courseId/enroll',
  protect,
  requireRole('student'),
  enrollmentValidator,
  validate,
  enrollInCourse
);

// Get own enrollments (student only)
router.get(
  '/students/me/enrollments',
  protect,
  requireRole('student'),
  getMyEnrollments
);

module.exports = router;
