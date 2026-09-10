// routes/instructorDashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getDashboard } = require('../controllers/instructorDashboardController');

router.use(protect);
router.use(requireRole('instructor', 'admin'));

router.get('/:id/dashboard', getDashboard);

module.exports = router;
