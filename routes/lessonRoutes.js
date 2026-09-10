const express = require('express');
const router = express.Router();

const { createLesson, getLessons, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { createLessonValidator, updateLessonValidator } = require('../validators/lessonValidator');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

// Public GET for lessons (approved courses only)
router.get('/modules/:moduleId/lessons', getLessons);

// Protected routes for instructors
router.use(protect);
router.use(requireRole('instructor'));

router.post('/modules/:moduleId/lessons', createLessonValidator, validate, createLesson);
router.put('/:id', updateLessonValidator, validate, updateLesson);
router.delete('/:id', deleteLesson);

module.exports = router;
