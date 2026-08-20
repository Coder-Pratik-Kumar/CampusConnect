import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import profileRoutes from './routes/profileRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Setup isolated express test server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/profile', profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const TEST_PORT = 5005;

/**
 * Helper to make HTTP requests over 127.0.0.1
 */
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

async function runProfileApiTests() {
  console.log('==================================================');
  console.log(' 🧪 AUTHENTICATED PROFILE & SKILLS API TEST SUITE');
  console.log('==================================================\n');

  await connectDB();

  let server;
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const testEmail = `profile_test_${Date.now()}@university.edu`;
  let testUser;
  let validToken;
  let passedCount = 0;
  const totalCount = 6;

  try {
    // Clean up pre-existing user if any
    await User.deleteMany({ email: testEmail });

    // Setup test user in database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);
    testUser = await User.create({
      name: 'Initial Name',
      email: testEmail,
      password: hashedPassword,
      college: 'Initial College',
      major: 'Initial Major',
      bio: 'Initial Bio',
      teachSkills: ['Git'],
      learnSkills: ['Node.js'],
    });

    validToken = jwt.sign({ id: testUser._id.toString() }, config.jwtSecret, {
      expiresIn: '1h',
    });

    // ──────────────────────────────────────────────────
    // TEST 1: Get profile with valid JWT
    // ──────────────────────────────────────────────────
    console.log('Test 1: GET /api/profile with valid JWT');
    const res1 = await makeRequest({
      port: TEST_PORT,
      path: '/api/profile',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    if (
      res1.status === 200 &&
      res1.body.status === 'success' &&
      res1.body.data.user.email === testEmail &&
      res1.body.data.user.password === undefined
    ) {
      console.log('   ✅ PASSED — Profile retrieved successfully. Password excluded.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED —', res1);
    }

    // ──────────────────────────────────────────────────
    // TEST 2: Get profile without JWT
    // ──────────────────────────────────────────────────
    console.log('\nTest 2: GET /api/profile without JWT');
    const res2 = await makeRequest({
      port: TEST_PORT,
      path: '/api/profile',
      method: 'GET',
    });

    if (res2.status === 401 && res2.body.status === 'fail') {
      console.log('   ✅ PASSED — Rejected request without token (401 Unauthorized).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED —', res2);
    }

    // ──────────────────────────────────────────────────
    // TEST 3: Update profile info (name, college, major, bio, avatar)
    // ──────────────────────────────────────────────────
    console.log('\nTest 3: PUT /api/profile (Update basic info)');
    const updateInfoPayload = {
      name: 'Jane Student',
      college: 'Stanford University',
      major: 'Computer Science',
      bio: 'Passionate about web dev and AI.',
      avatar: 'https://example.com/jane.jpg',
    };

    const res3 = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      },
      updateInfoPayload
    );

    if (
      res3.status === 200 &&
      res3.body.status === 'success' &&
      res3.body.data.user.name === 'Jane Student' &&
      res3.body.data.user.college === 'Stanford University' &&
      res3.body.data.user.bio === 'Passionate about web dev and AI.' &&
      res3.body.data.user.password === undefined
    ) {
      console.log('   ✅ PASSED — Basic profile information updated successfully.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED —', res3);
    }

    // ──────────────────────────────────────────────────
    // TEST 4: Update skills & availability
    // ──────────────────────────────────────────────────
    console.log('\nTest 4: PUT /api/profile (Update skills & availability)');
    const updateSkillsPayload = {
      teachSkills: ['React', 'JavaScript', 'Tailwind CSS'],
      learnSkills: ['Python', 'MongoDB', 'Docker'],
      availability: [
        { day: 'Monday', startTime: '10:00', endTime: '12:00' },
        { day: 'Thursday', startTime: '15:00', endTime: '17:00' },
      ],
    };

    const res4 = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      },
      updateSkillsPayload
    );

    if (
      res4.status === 200 &&
      res4.body.status === 'success' &&
      res4.body.data.user.teachSkills.length === 3 &&
      res4.body.data.user.teachSkills.includes('React') &&
      res4.body.data.user.learnSkills.includes('MongoDB') &&
      res4.body.data.user.availability.length === 2
    ) {
      console.log('   ✅ PASSED — Teach skills, learn skills, and availability updated.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED —', res4);
    }

    // ──────────────────────────────────────────────────
    // TEST 5: Invalid input handling
    // ──────────────────────────────────────────────────
    console.log('\nTest 5: PUT /api/profile (Invalid data handling)');

    // Subtest A: Empty name
    const invalidNameRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      },
      { name: '   ' }
    );

    // Subtest B: Bio > 500 chars
    const invalidBioRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      },
      { bio: 'a'.repeat(501) }
    );

    // Subtest C: Invalid availability day
    const invalidAvailRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      },
      { availability: [{ day: 'Funday', startTime: '09:00', endTime: '10:00' }] }
    );

    if (
      invalidNameRes.status === 400 &&
      invalidBioRes.status === 400 &&
      invalidAvailRes.status === 400
    ) {
      console.log('   ✅ PASSED — Rejected empty name, long bio (>500 chars), and bad availability day.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Invalid input handling:', {
        invalidNameRes: invalidNameRes.status,
        invalidBioRes: invalidBioRes.status,
        invalidAvailRes: invalidAvailRes.status,
      });
    }

    // ──────────────────────────────────────────────────
    // TEST 6: Verify changes persist in MongoDB
    // ──────────────────────────────────────────────────
    console.log('\nTest 6: Verify persistence in MongoDB database');
    const persistedUser = await User.findById(testUser._id);

    if (
      persistedUser &&
      persistedUser.name === 'Jane Student' &&
      persistedUser.college === 'Stanford University' &&
      persistedUser.teachSkills.includes('React') &&
      persistedUser.learnSkills.includes('MongoDB') &&
      persistedUser.availability.length === 2
    ) {
      console.log('   ✅ PASSED — Verified all updated fields directly in MongoDB database.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — MongoDB persistence check failed:', persistedUser);
    }
  } catch (err) {
    console.error('❌ Error executing tests:', err);
  } finally {
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      console.log('\n🧹 Cleaned up test user document from MongoDB.');
    }
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

runProfileApiTests();
