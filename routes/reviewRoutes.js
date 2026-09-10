// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createReview, getCourseReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { createReviewValidator } = require('../validators/reviewValidator');

router.use(protect);
router.use(requireRole('student'));

router.post('/', createReviewValidator, (req, res, next) => { next(); }, createReview);
router.get('/course/:courseId', getCourseReviews);
router.put('/:reviewId', (req, res, next) => { next(); }, updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;
