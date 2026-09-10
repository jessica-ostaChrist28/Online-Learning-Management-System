require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const connectDB = require('./config/db');
// Ensure MongoDB URI is set for tests
if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/cia3-lms-test';

(async () => {
  const base = 'http://127.0.0.1:5000/api';
  // Helper for reporting
  const report = (name, expected, res, body) => {
    if (res.status === expected) console.log(`PASS: ${name}`);
    else console.log(`FAIL: ${name} - Expected ${expected}, got ${res.status}. Body: ${JSON.stringify(body)}`);
  };

  // Register instructor (to create approved course)
  const instructorEmail = `inst${Date.now()}@example.com`;
  let res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Inst', email: instructorEmail, password: 'pass123', role: 'instructor' })
  });
  await res.json(); // ignore output
  res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: instructorEmail, password: 'pass123' })
  });
  const instructorToken = (await res.json()).token;

  // Create a course (pending)
  res = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Approved Course', description: 'Desc', category: 'Tech', level: 'Beginner' })
  });
  const course = (await res.json()).data;

  // Directly set course to approved via Mongoose (bypass API)
  await connectDB();
  await Course.findByIdAndUpdate(course._id, { status: 'approved' });

  // Register student
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

  // Enroll in approved course (should succeed)
  res = await fetch(`${base}/courses/${course._id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const body = await res.json();
  report('Enroll approved course', 201, res, body);

  // Duplicate enrollment (should be rejected)
  res = await fetch(`${base}/courses/${course._id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const dupBody = await res.json();
  report('Duplicate enrollment', 409, res, dupBody);

  // Get student enrollments
  res = await fetch(`${base}/students/me/enrollments`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const enrollmentsBody = await res.json();
  report('Get my enrollments', 200, res, enrollmentsBody);

  // Cleanup: close mongoose connection
  await mongoose.disconnect();
})();
