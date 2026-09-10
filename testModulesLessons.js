// Integration tests for Module & Lesson Management (Step 4)
// Requires the server to be running on localhost:5000
// Uses global fetch (Node 18+)

const base = 'http://127.0.0.1:5000/api';
let instructorToken = '';
let courseId = '';
let moduleId = '';
let lessonId = '';

const report = (name, expected, res, body) => {
  if (res.status === expected) {
    console.log(`PASS: ${name}`);
  } else {
    console.log(`FAIL: ${name} - Expected ${expected}, got ${res.status}. Body: ${JSON.stringify(body)}`);
  }
};

(async () => {
  // Register instructor
  const email = `instructor${Date.now()}@example.com`;
  let res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Inst', email, password: 'password123', role: 'instructor' })
  });
  let body = await res.json();
  report('Instructor registration', 201, res, body);

  // Login instructor
  res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  body = await res.json();
  instructorToken = body.token;
  report('Instructor login', 200, res, body);

  // Create a pending course
  res = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Test Course', description: 'Desc', category: 'Science', level: 'Beginner' })
  });
  body = await res.json();
  courseId = body.data._id;
  report('Create pending course', 201, res, body);

  // Create a module under the course
  res = await fetch(`${base}/modules/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Module 1', description: 'Mod Desc', order: 1 })
  });
  body = await res.json();
  moduleId = body.data._id;
  report('Create module', 201, res, body);

  // Update the module
  res = await fetch(`${base}/modules/${moduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Module 1 Updated', order: 2 })
  });
  body = await res.json();
  report('Update module', 200, res, body);

  // Create a lesson under the module
  res = await fetch(`${base}/lessons/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Lesson 1', content: 'Lesson content', videoUrl: 'http://example.com/video.mp4', order: 1 })
  });
  body = await res.json();
  lessonId = body.data._id;
  report('Create lesson', 201, res, body);

  // Update the lesson
  res = await fetch(`${base}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Lesson 1 Updated', order: 2 })
  });
  body = await res.json();
  report('Update lesson', 200, res, body);

  // Delete lesson
  res = await fetch(`${base}/lessons/${lessonId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${instructorToken}` } });
  body = await res.json();
  report('Delete lesson', 200, res, body);

  // Delete module (cascade deletes any remaining lessons)
  res = await fetch(`${base}/modules/${moduleId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${instructorToken}` } });
  body = await res.json();
  report('Delete module', 200, res, body);

  // Delete course
  res = await fetch(`${base}/courses/${courseId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${instructorToken}` } });
  body = await res.json();
  report('Delete course', 200, res, body);
})();
