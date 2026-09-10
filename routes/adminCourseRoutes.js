// routes/adminCourseRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { approveCourse, rejectCourse } = require('../controllers/adminCourseController');

router.use(protect);
router.use(requireRole('admin'));

router.put('/:id/approve', approveCourse);
router.put('/:id/reject', rejectCourse);

module.exports = router;
