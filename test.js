const tests = async () => {
  const base = 'http://127.0.0.1:5000/api';
  let studentToken = '';

  const report = (name, expected, res, body) => {
    if (res.status === expected) {
      console.log(`PASS: ${name}`);
    } else {
      console.log(`FAIL: ${name} - Expected ${expected}, got ${res.status}. Body: ${JSON.stringify(body)}`);
    }
  };

  try {
    // Test 1: Valid registration
    const email = `test${Date.now()}@example.com`;
    let res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', email, password: 'password123', role: 'student' })
    });
    let body = await res.json();
    report('Valid registration', 201, res, body);

    // Test 2: Duplicate registration
    res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', email, password: 'password123', role: 'student' })
    });
    body = await res.json();
    report('Duplicate registration', 409, res, body);

    // Test 3: Invalid email
    res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', email: 'notanemail', password: 'password123' })
    });
    body = await res.json();
    report('Invalid email', 400, res, body);

    // Test 4: Missing required field
    res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', email: `test2${Date.now()}@example.com` })
    });
    body = await res.json();
    report('Missing required field', 400, res, body);

    // Test 5: Valid login
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    body = await res.json();
    studentToken = body.token;
    report('Valid login', 200, res, body);

    // Test 6: Wrong password
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' })
    });
    body = await res.json();
    report('Wrong password', 401, res, body);

    // Test 7: Non-existent user
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' })
    });
    body = await res.json();
    report('Non-existent user', 401, res, body);

    // Test 8: Protected route without token
    res = await fetch(`${base}/test/student`);
    body = await res.json();
    report('Protected route without token', 401, res, body);

    // Test 9: Invalid token
    res = await fetch(`${base}/test/student`, {
      headers: { 'Authorization': 'Bearer invalidtoken' }
    });
    body = await res.json();
    report('Invalid token', 401, res, body);

    // Test 10: Valid token with unauthorized role (Student trying admin)
    res = await fetch(`${base}/test/admin`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    body = await res.json();
    report('Valid token with unauthorized role', 403, res, body);

    // Test 11: Valid token with correct role (Student trying student)
    res = await fetch(`${base}/test/student`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    body = await res.json();
    report('Valid token with correct role', 200, res, body);

  } catch (err) {
    console.error("Test script failed", err);
  }
};

tests();
