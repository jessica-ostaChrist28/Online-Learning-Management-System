// controllers/instructorDashboardController.js
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

exports.getDashboard = async (req, res) => {
  try {
    const instructorId = req.params.id;
    // Ensure requesting user is the same instructor (or admin)
    if (req.user.role !== 'admin' && req.user._id.toString() !== instructorId) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'ACCESS_DENIED' });
    }

    // Instructor info
    const instructorInfo = { id: instructorId, name: req.user.name, email: req.user.email };

    // Courses owned by instructor
    const courses = await Course.find({ instructorId }).lean();
    const totalCourses = courses.length;
    const statusCounts = courses.reduce((acc, cur) => {
      acc[cur.status] = (acc[cur.status] || 0) + 1;
      return acc;
    }, {});

    // Total enrollments across instructor's courses
    const courseIds = courses.map(c => c._id);
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();
    const totalEnrollments = enrollments.length;

    // Enrollment breakdown per course
    const enrollmentPerCourse = {};
    enrollments.forEach(e => {
      const cid = e.courseId.toString();
      enrollmentPerCourse[cid] = (enrollmentPerCourse[cid] || 0) + 1;
    });

    // Compute progress stats per course (optional, simple total lessons)
    const modules = await Module.find({ courseId: { $in: courseIds } }).lean();
    const moduleIds = modules.map(m => m._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });

    const data = {
      instructor: instructorInfo,
      totalCourses,
      statusCounts,
      totalEnrollments,
      enrollmentPerCourse,
      totalLessons,
    };
    res.status(200).json({ success: true, data, message: 'Dashboard retrieved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', errorCode: 'SERVER_ERROR' });
  }
};
