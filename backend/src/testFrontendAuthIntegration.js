import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const TEST_PORT = 5009;

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', ...options }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAuthIntegrationTests() {
  console.log('==================================================');
  console.log(' 🧪 FRONTEND-BACKEND AUTH INTEGRATION SUITE');
  console.log('==================================================\n');

  await connectDB();

  let server;
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const testEmail = `fe_auth_test_${Date.now()}@university.edu`;
  let passedCount = 0;
  const totalCount = 5;
  let receivedToken;

  try {
    // Clean up pre-existing user
    await User.deleteMany({ email: testEmail });

    // ──────────────────────────────────────────────────
    // TEST 1: POST /api/auth/register (Registration UI flow)
    // ──────────────────────────────────────────────────
    console.log('Test 1: POST /api/auth/register (Register UI Flow)');
    const regRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Frontend Test User',
        email: testEmail,
        password: 'password123',
        college: 'State University',
      }
    );

    if (
      regRes.status === 201 &&
      regRes.body.status === 'success' &&
      regRes.body.data.user.email === testEmail
    ) {
      console.log('   ✅ PASSED — Registered user successfully via API (HTTP 201).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Registration test failed:', regRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 2: POST /api/auth/login (Login UI flow)
    // ──────────────────────────────────────────────────
    console.log('\nTest 2: POST /api/auth/login (Login UI Flow)');
    const loginRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'password123',
      }
    );

    if (
      loginRes.status === 200 &&
      loginRes.body.status === 'success' &&
      loginRes.body.data.token
    ) {
      receivedToken = loginRes.body.data.token;
      console.log('   ✅ PASSED — Logged in successfully. Issued JWT token.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Login test failed:', loginRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 3: GET /api/auth/me (Session restoration flow)
    // ──────────────────────────────────────────────────
    console.log('\nTest 3: GET /api/auth/me (AuthContext Session Restoration)');
    const meRes = await makeRequest({
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${receivedToken}` },
    });

    if (
      meRes.status === 200 &&
      meRes.body.status === 'success' &&
      meRes.body.data.user.name === 'Frontend Test User'
    ) {
      console.log('   ✅ PASSED — Verified token & retrieved user session (HTTP 200).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Session restoration test failed:', meRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 4: Invalid Credentials Error Handling
    // ──────────────────────────────────────────────────
    console.log('\nTest 4: Invalid Credentials Handling (Wrong password)');
    const badLoginRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'wrongpassword',
      }
    );

    if (badLoginRes.status === 401 && badLoginRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Rejected invalid credentials (401 Unauthorized).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Invalid credentials test failed:', badLoginRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 5: Protected Route Access Blocking (Without Token)
    // ──────────────────────────────────────────────────
    console.log('\nTest 5: Protected Route Blocking (Unauthenticated request)');
    const unauthRes = await makeRequest({
      port: TEST_PORT,
      path: '/api/profile',
      method: 'GET',
    });

    if (unauthRes.status === 401 && unauthRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Unauthenticated access blocked (401 Unauthorized).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Protected route blocking test failed:', unauthRes);
    }

  } catch (err) {
    console.error('❌ Error executing integration tests:', err);
  } finally {
    await User.deleteMany({ email: testEmail });
    console.log('\n🧹 Cleaned up test user document from MongoDB.');

    if (server) {
      server.close();
    }
    await mongoose.disconnect();

    console.log('\n==================================================');
    console.log(` 📊 SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
    console.log('==================================================\n');

    process.exit(passedCount === totalCount ? 0 : 1);
  }
}

runAuthIntegrationTests();
