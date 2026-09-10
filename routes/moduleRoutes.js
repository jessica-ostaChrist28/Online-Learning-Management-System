const express = require('express');
const router = express.Router();

const { createModule, getModules, updateModule, deleteModule } = require('../controllers/moduleController');
const { createModuleValidator, updateModuleValidator } = require('../validators/moduleValidator');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

// Public GET for modules (approved courses only)
router.get('/courses/:courseId/modules', getModules);

// Protected routes for instructors
router.use(protect);
router.use(requireRole('instructor'));

router.post('/courses/:courseId/modules', createModuleValidator, validate, createModule);
router.put('/:id', updateModuleValidator, validate, updateModule);
router.delete('/:id', deleteModule);

module.exports = router;
