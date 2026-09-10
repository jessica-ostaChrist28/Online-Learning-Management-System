// controllers/certificateController.js
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

exports.checkEligibility = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    // Ensure authenticated user matches studentId
    if (req.user._id.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'ACCESS_DENIED' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found', errorCode: 'COURSE_NOT_FOUND' });
    }
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found', errorCode: 'ENROLLMENT_NOT_FOUND' });
    }
    // total lessons in the course
    const modules = await Module.find({ courseId }).select('_id');
    const moduleIds = modules.map(m => m._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });
    const completed = enrollment.completedLessons.length;
    const eligible = totalLessons > 0 && completed === totalLessons;
    const percentage = totalLessons === 0 ? 0 : (completed / totalLessons) * 100;
    res.status(200).json({
      success: true,
      data: { eligible, completedLessons: completed, totalLessons, completionPercentage: percentage },
      message: eligible ? 'Eligible for certificate' : 'Not eligible for certificate'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};
