const Course = require('../models/Course');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, level } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      level,
      instructorId: req.user._id,
      status: 'pending' // always default to pending regardless of input
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses for logged in instructor
// @route   GET /api/courses/mine
// @access  Private/Instructor
const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructorId: req.user._id });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Verify ownership
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to update this course',
        errorCode: 'FORBIDDEN'
      });
    }

    // Do not allow status to be changed to approved by instructor directly
    const updateData = { ...req.body };
    delete updateData.instructorId; // Prevent reassignment
    if (updateData.status === 'approved') {
      delete updateData.status; // Prevent unauthorized approval
    }

    course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Verify ownership
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to delete this course',
        errorCode: 'FORBIDDEN'
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public (approved) courses
// @route   GET /api/courses
// @access  Public
const getPublicCourses = async (req, res, next) => {
  try {
    let query = { status: 'approved' };

    // Simple search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Level filter
    if (req.query.level) {
      query.level = req.query.level;
    }

    const courses = await Course.find(query).populate('instructorId', 'name email');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  getPublicCourses
};
