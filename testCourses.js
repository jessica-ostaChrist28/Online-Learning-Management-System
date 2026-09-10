// Using global fetch (Node 18+)
const base = 'http://127.0.0.1:5000/api';
let instructorToken = '';
let instructorId = '';
let courseId = '';

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

  // Instructor creates course
  res = await fetch(`${base}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Test Course', description: 'Desc', category: 'Science', level: 'Beginner' })
  });
  body = await res.json();
  courseId = body.data._id;
  report('Create course (pending)', 201, res, body);

  // Instructor views own courses
  res = await fetch(`${base}/courses/mine`, {
    headers: { 'Authorization': `Bearer ${instructorToken}` }
  });
  body = await res.json();
  report('Get own courses', 200, res, body);

  // Instructor updates own course (change title)
  res = await fetch(`${base}/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Updated Title' })
  });
  body = await res.json();
  report('Update own course', 200, res, body);

  // Instructor attempts to set status approved (should be ignored)
  res = await fetch(`${base}/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${instructorToken}` },
    body: JSON.stringify({ status: 'approved' })
  });
  body = await res.json();
  const statusIsPending = body.data.status === 'pending';
  console.log(statusIsPending ? 'PASS: Instructor cannot set approved' : 'FAIL: Instructor status change allowed');

  // Student tries to create course (should 403)
  const studentEmail = `student${Date.now()}@example.com`;
  await fetch(`${base}/auth/register`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Stu',email:studentEmail,password:'pwd123'})});
  let loginRes = await fetch(`${base}/auth/login`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:studentEmail,password:'pwd123'})});
  let loginBody = await loginRes.json();
  const studentToken = loginBody.token;
  res = await fetch(`${base}/courses`, {method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${studentToken}`},body:JSON.stringify({title:'Stu Course',description:'d',category:'Math',level:'Beginner'})});
  body = await res.json();
  report('Student create course forbidden', 403, res, body);

  // Public catalog should not include pending course
  res = await fetch(`${base}/courses`);
  body = await res.json();
  const found = body.data && body.data.some(c=>c._id===courseId);
  console.log(found ? 'FAIL: Pending course visible in public catalog' : 'PASS: Pending course hidden from public catalog');

  // Manually approve the course in DB via direct update (simulate admin) – for test we will PATCH using Mongo directly? We'll just use mongoose in script (but script not connected). Instead we can update via MongoDB Atlas console – not possible here. We'll skip approval test.

  // Delete own course
  res = await fetch(`${base}/courses/${courseId}`, {method:'DELETE', headers:{'Authorization':`Bearer ${instructorToken}`}});
  body = await res.json();
  report('Delete own course', 200, res, body);
})();
