const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll authenticated student in a course
// @route   POST /api/courses/:courseId/enroll
// @access  Private (student)
const enrollInCourse = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    // Verify course exists and is approved
    const course = await Course.findOne({ _id: courseId, status: 'approved' });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not approved',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Check for existing enrollment (unique index also protects)
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Student already enrolled in this course',
        errorCode: 'ENROLLMENT_EXISTS'
      });
    }

    const enrollment = await Enrollment.create({ studentId, courseId, completedLessons: [] });
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get authenticated student's enrollments
// @route   GET /api/students/me/enrollments
// @access  Private (student)
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate('courseId', 'title description category level status');
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};

module.exports = { enrollInCourse, getMyEnrollments };
