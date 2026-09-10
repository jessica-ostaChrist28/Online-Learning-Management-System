const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

// Helper to format success response consistently
const successResponse = (res, data, message = 'Success') => {
  return res.status(200).json({ success: true, data, message, errorCode: null });
};

// POST /api/courses/:courseId/lessons/:lessonId/complete
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user._id;

    // Verify Course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found', errorCode: 'COURSE_NOT_FOUND' });
    }

    // Verify Lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found', errorCode: 'LESSON_NOT_FOUND' });
    }

    // Verify Module belongs to the Course
    const module = await Module.findById(lesson.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found', errorCode: 'MODULE_NOT_FOUND' });
    }
    if (module.courseId.toString() !== courseId) {
      return res.status(400).json({ success: false, message: 'Lesson does not belong to the specified course', errorCode: 'INVALID_LESSON_COURSE_MISMATCH' });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Student not enrolled in this course', errorCode: 'NOT_ENROLLED' });
    }

    // Add lesson to completedLessons if not already present
    const lessonIdStr = lessonId.toString();
    if (!enrollment.completedLessons.includes(lessonIdStr)) {
      enrollment.completedLessons.push(lessonIdStr);
      await enrollment.save();
    }

    return successResponse(res, { enrollmentId: enrollment._id, completedLessons: enrollment.completedLessons }, 'Lesson marked as completed');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};

// GET /api/students/:studentId/progress/:courseId
const getCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    // Ensure the authenticated user matches the studentId param
    if (req.user._id.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'ACCESS_DENIED' });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found', errorCode: 'ENROLLMENT_NOT_FOUND' });
    }

    // Count total lessons for the course
    const modules = await Module.find({ courseId });
    const moduleIds = modules.map(m => m._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });
    const completed = enrollment.completedLessons.length;
    const progressPercentage = totalLessons === 0 ? 0 : (completed / totalLessons) * 100;

    const data = {
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      completedLessons: enrollment.completedLessons,
      totalLessons,
      progressPercentage,
    };
    return successResponse(res, data, 'Progress retrieved');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};

module.exports = { completeLesson, getCourseProgress };
