// controllers/reviewController.js
const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Create a review for a course
exports.createReview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, rating, comment } = req.body;

    // Ensure student is enrolled in the course
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled in course', errorCode: 'NOT_ENROLLED' });
    }

    const review = await Review.create({ studentId, courseId, rating, comment });
    res.status(201).json({ success: true, data: review, message: 'Review created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};

// Get all reviews for a course (including average rating)
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ courseId }).populate('studentId', 'name email');

    const agg = await Review.aggregate([
      { $match: { courseId: require('mongoose').Types.ObjectId(courseId) } },
      { $group: { _id: '$courseId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = agg[0] || { avgRating: null, count: 0 };

    res.status(200).json({ success: true, data: { reviews, averageRating: stats.avgRating, totalReviews: stats.count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};

// Update own review
exports.updateReview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: reviewId, studentId });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found', errorCode: 'REVIEW_NOT_FOUND' });
    }
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();
    res.status(200).json({ success: true, data: review, message: 'Review updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};

// Delete own review
exports.deleteReview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { reviewId } = req.params;
    const review = await Review.findOneAndDelete({ _id: reviewId, studentId });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found', errorCode: 'REVIEW_NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};
