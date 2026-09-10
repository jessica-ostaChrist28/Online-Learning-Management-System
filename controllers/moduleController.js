const Module = require('../models/Module');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @desc    Create a new module under a course
// @route   POST /api/courses/:courseId/modules
// @access  Private (instructor)
const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    // Verify ownership
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'User is not authorized to add modules to this course', errorCode: 'FORBIDDEN' });
    }

    const module = await Module.create({
      courseId,
      title,
      description,
      order: order ?? 0
    });

    res.status(201).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

// @desc    Get modules for a course (public, only approved courses)
// @route   GET /api/courses/:courseId/modules
// @access  Public
const getModules = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ _id: courseId, status: 'approved' });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not approved', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const modules = await Module.find({ courseId }).sort({ order: 1 });
    res.status(200).json({ success: true, count: modules.length, data: modules });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private (instructor)
const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const course = await Course.findById(module.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Parent course not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'User is not authorized to update this module', errorCode: 'FORBIDDEN' });
    }
    // Apply allowed updates
    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;

    await module.save();
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a module (and its lessons)
// @route   DELETE /api/modules/:id
// @access  Private (instructor)
const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const course = await Course.findById(module.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Parent course not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'User is not authorized to delete this module', errorCode: 'FORBIDDEN' });
    }
    // Cascade delete lessons
    await Lesson.deleteMany({ moduleId: module._id });
    await module.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { createModule, getModules, updateModule, deleteModule };
