const fs = require('fs');

let envApiBaseUrl = process.env.VITE_API_BASE_URL;

if (!envApiBaseUrl && fs.existsSync('.env')) {
  const envText = fs.readFileSync('.env', 'utf8');
  const match = envText.match(/^VITE_API_BASE_URL=(.*)$/m);
  if (match) {
    envApiBaseUrl = match[1].trim();
  }
}

const API_BASE_URL = envApiBaseUrl || 'http://localhost:5000/api';

const test = async () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Priya Sundaram',
    email: `priya_${timestamp}@example.com`,
    mobile: `98765${timestamp.toString().slice(-5)}`,
    password: 'Customer@123'
  };

  console.log(`Using API Base URL from .env: ${API_BASE_URL}`);

  console.log('--- Testing Customer Register ---');
  let res = await fetch(`${API_BASE_URL}/auth/customer-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  let data = await res.json();
  console.log('Register Status:', res.status, data);

  if (!data.success) {
    console.error('Registration test failed!');
    return;
  }

  const token = data.token;

  console.log('\n--- Testing Customer Login (By Email) ---');
  res = await fetch(`${API_BASE_URL}/auth/customer-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId: testUser.email, password: testUser.password })
  });
  data = await res.json();
  console.log('Login By Email Status:', res.status, data);

  console.log('\n--- Testing Customer Login (By Mobile) ---');
  res = await fetch(`${API_BASE_URL}/auth/customer-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId: testUser.mobile, password: testUser.password })
  });
  data = await res.json();
  console.log('Login By Mobile Status:', res.status, data);

  console.log('\n--- Testing Customer Profile (Protected GET /api/auth/customer-profile) ---');
  res = await fetch(`${API_BASE_URL}/auth/customer-profile`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  data = await res.json();
  console.log('Profile Status:', res.status, data);
};

test();
