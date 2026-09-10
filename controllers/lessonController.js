const Module = require('../models/Module');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @desc    Create a new lesson under a module
// @route   POST /api/modules/:moduleId/lessons
// @access  Private (instructor)
const createLesson = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { title, content, videoUrl, order } = req.body;

    // Verify module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    // Verify parent course and ownership
    const course = await Course.findById(module.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Parent course not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'User is not authorized to add lessons to this module', errorCode: 'FORBIDDEN' });
    }

    const lesson = await Lesson.create({
      moduleId,
      title,
      content,
      videoUrl,
      order: order ?? 0
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lessons for a module (public, only approved courses)
// @route   GET /api/modules/:moduleId/lessons
// @access  Public
const getLessons = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const course = await Course.findOne({ _id: module.courseId, status: 'approved' });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not approved', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const lessons = await Lesson.find({ moduleId }).sort({ order: 1 });
    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private (instructor)
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, videoUrl, order } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const module = await Module.findById(lesson.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Parent module not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const course = await Course.findById(module.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Parent course not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'User is not authorized to update this lesson', errorCode: 'FORBIDDEN' });
    }
    // Apply allowed updates
    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (order !== undefined) lesson.order = order;

    await lesson.save();
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (instructor)
const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const module = await Module.findById(lesson.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Parent module not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    const course = await Course.findById(module.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Parent course not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'User is not authorized to delete this lesson', errorCode: 'FORBIDDEN' });
    }
    await lesson.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLesson, getLessons, updateLesson, deleteLesson };
