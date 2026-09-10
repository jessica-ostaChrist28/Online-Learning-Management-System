// controllers/adminCourseController.js
const Course = require('../models/Course');

// Approve a pending course
exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found', errorCode: 'COURSE_NOT_FOUND' });
    }
    if (course.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending courses can be approved', errorCode: 'INVALID_STATUS_TRANSITION' });
    }
    course.status = 'approved';
    await course.save();
    res.status(200).json({ success: true, data: course, message: 'Course approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};

// Reject a pending course
exports.rejectCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found', errorCode: 'COURSE_NOT_FOUND' });
    }
    if (course.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending courses can be rejected', errorCode: 'INVALID_STATUS_TRANSITION' });
    }
    course.status = 'rejected';
    await course.save();
    res.status(200).json({ success: true, data: course, message: 'Course rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};
