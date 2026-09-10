const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  completedLessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }]
}, { timestamps: true });

// Prevent duplicate enrollment of same student in same course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
