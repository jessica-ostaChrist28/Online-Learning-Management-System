// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.ObjectId, ref: 'Course', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
