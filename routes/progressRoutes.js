const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateProgressParams } = require('../validators/progressValidator');
const { completeLesson, getCourseProgress } = require('../controllers/progressController');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Complete lesson
router.post('/courses/:courseId/lessons/:lessonId/complete',
  protect,
  requireRole('student'),
  validateProgressParams,
  validate,
  completeLesson
);

// Get progress for a student
router.get('/students/:studentId/progress/:courseId',
  protect,
  requireRole('student'),
  // No body validation needed, just param validation could be added if desired
  getCourseProgress
);

module.exports = router;
