require('dotenv').config();
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // fallback if needed
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');
const connectDB = require('./config/db');

// Ensure MongoDB URI is set for tests
if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/cia3-lms-test';

(async () => {
  const base = 'http://127.0.0.1:5000/api';
  const report = (name, expected, res, body) => {
    if (res.status === expected) console.log(`PASS: ${name}`);
    else console.log(`FAIL: ${name} - Expected ${expected}, got ${res.status}. Body: ${JSON.stringify(body)}`);
  };

  // ---------- Setup ----------
  // Instructor creates approved course with module and lesson
  const instructorEmail = `inst${Date.now()}@example.com`;
  let res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Inst', email: instructorEmail, password: 'pass123', role: 'instructor' })
  });
  await res.json();
  res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: instructorEmail, password: 'pass123' })
  });
  const instructorToken = (await res.json()).token;

  // Create course (pending)
  res = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Progress Course', description: 'Desc', category: 'Tech', level: 'Beginner' })
  });
  const course = (await res.json()).data;
  // Approve the course directly via DB
  await connectDB();
  await Course.findByIdAndUpdate(course._id, { status: 'approved' });

  // Create module
  res = await fetch(`${base}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Module 1', description: 'Mod Desc', order: 1, courseId: course._id })
  });
  const module = (await res.json()).data;

  // Create lesson
  res = await fetch(`${base}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Lesson 1', content: 'Content', order: 1, moduleId: module._id })
  });
  const lesson = (await res.json()).data;

  // Student registration and enrollment
  const studentEmail = `stud${Date.now()}@example.com`;
  res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Stud', email: studentEmail, password: 'pass123', role: 'student' })
  });
  await res.json();
  res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: 'pass123' })
  });
  const studentToken = (await res.json()).token;

  // Enroll student
  res = await fetch(`${base}/courses/${course._id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  await res.json(); // ignore body

  // ---------- Tests ----------
  // 1. Complete lesson (valid)
  res = await fetch(`${base}/courses/${course._id}/lessons/${lesson._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  report('Complete lesson (valid)', 200, res, await res.json());

  // 2. Duplicate completion (idempotent)
  res = await fetch(`${base}/courses/${course._id}/lessons/${lesson._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  report('Duplicate lesson completion', 200, res, await res.json());

  // 3. Get progress (should be 100%)
  res = await fetch(`${base}/students/${studentEmail.replace(/@.*/, '')}/progress/${course._id}`, { // we need studentId (Mongo _id) not email; fetch after enrollment
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  // Actually retrieve studentId via enrollment data
  const enrollmentRes = await fetch(`${base}/students/me/enrollments`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const enrollmentsBody = await enrollmentRes.json();
  const studentId = enrollmentsBody.data[0].studentId;
  res = await fetch(`${base}/students/${studentId}/progress/${course._id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const progressBody = await res.json();
  report('Get progress (100%)', 200, res, progressBody);

  // 4. Unauthenticated request (should be 401)
  res = await fetch(`${base}/courses/${course._id}/lessons/${lesson._id}/complete`, {
    method: 'POST'
  });
  report('Unauthenticated completion', 401, res, await res.json());

  // 5. Non-student role (instructor) trying to complete
  res = await fetch(`${base}/courses/${course._id}/lessons/${lesson._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` }
  });
  report('Instructor trying to complete lesson', 403, res, await res.json());

  // 6. Non-enrolled student cannot complete
  const otherStudentEmail = `stud2${Date.now()}@example.com`;
  res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Stud2', email: otherStudentEmail, password: 'pass123', role: 'student' })
  });
  await res.json();
  res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: otherStudentEmail, password: 'pass123' })
  });
  const otherStudentToken = (await res.json()).token;
  res = await fetch(`${base}/courses/${course._id}/lessons/${lesson._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherStudentToken}` }
  });
  report('Non-enrolled student completion', 403, res, await res.json());

  // 7. Nonexistent lesson
  const fakeLessonId = '64b8c9f5f1c2a8b1e5d7c9a0'; // random ObjectId-like string
  res = await fetch(`${base}/courses/${course._id}/lessons/${fakeLessonId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  report('Nonexistent lesson', 404, res, await res.json());

  // 8. Lesson from another course
  // Create second course & lesson
  const otherCourseRes = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Other Course', description: 'Desc', category: 'Tech', level: 'Beginner' })
  });
  const otherCourse = (await otherCourseRes.json()).data;
  await Course.findByIdAndUpdate(otherCourse._id, { status: 'approved' });
  const otherModuleRes = await fetch(`${base}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Other Module', description: 'Desc', order: 1, courseId: otherCourse._id })
  });
  const otherModule = (await otherModuleRes.json()).data;
  const otherLessonRes = await fetch(`${base}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Other Lesson', content: 'Content', order: 1, moduleId: otherModule._id })
  });
  const otherLesson = (await otherLessonRes.json()).data;
  // Attempt to complete other lesson using original courseId
  res = await fetch(`${base}/courses/${course._id}/lessons/${otherLesson._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  report('Lesson from another course', 400, res, await res.json());

  // 9. Student cannot view another student's progress
  res = await fetch(`${base}/students/${studentId}/progress/${course._id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${otherStudentToken}` }
  });
  report('View another student progress', 403, res, await res.json());

  // 10. Zero‑lesson course progress = 0
  const zeroCourseRes = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Empty Course', description: 'No content', category: 'Tech', level: 'Beginner' })
  });
  const zeroCourse = (await zeroCourseRes.json()).data;
  await Course.findByIdAndUpdate(zeroCourse._id, { status: 'approved' });
  // enroll another student (reuse otherStudentToken) in zero‑lesson course
  res = await fetch(`${base}/courses/${zeroCourse._id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherStudentToken}` }
  });
  await res.json();
  // fetch progress
  const zeroEnrollRes = await fetch(`${base}/students/me/enrollments`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${otherStudentToken}` }
  });
  const zeroEnrollBody = await zeroEnrollRes.json();
  const zeroStudentId = zeroEnrollBody.data[0].studentId;
  res = await fetch(`${base}/students/${zeroStudentId}/progress/${zeroCourse._id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${otherStudentToken}` }
  });
  const zeroProgress = await res.json();
  report('Zero‑lesson course progress', 200, res, zeroProgress);

  // Cleanup
  await mongoose.disconnect();
})();
