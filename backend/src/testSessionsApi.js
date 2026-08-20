import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Session from './models/Session.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Setup isolated express test server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sessions', sessionRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const TEST_PORT = 5007;

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

async function runSessionsApiTests() {
  console.log('==================================================');
  console.log(' 🧪 LEARNING SESSIONS API & BUSINESS RULES SUITE');
  console.log('==================================================\n');

  await connectDB();

  let server;
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const emailPrefix = `sess_test_${Date.now()}`;
  let passedCount = 0;
  const totalCount = 7;

  let studentA, studentB, studentC;
  let tokenA, tokenB, tokenC;

  try {
    // Clean up pre-existing test data
    await User.deleteMany({ email: new RegExp(emailPrefix) });
    await Session.deleteMany({ skill: 'React Peer Session' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);

    studentA = await User.create({
      name: 'Student A (Requester)',
      email: `${emailPrefix}_a@university.edu`,
      password: hashedPassword,
      college: 'MIT',
    });

    studentB = await User.create({
      name: 'Student B (Provider)',
      email: `${emailPrefix}_b@university.edu`,
      password: hashedPassword,
      college: 'MIT',
    });

    studentC = await User.create({
      name: 'Student C (Third Party)',
      email: `${emailPrefix}_c@university.edu`,
      password: hashedPassword,
      college: 'Stanford',
    });

    tokenA = jwt.sign({ id: studentA._id.toString() }, config.jwtSecret, { expiresIn: '1h' });
    tokenB = jwt.sign({ id: studentB._id.toString() }, config.jwtSecret, { expiresIn: '1h' });
    tokenC = jwt.sign({ id: studentC._id.toString() }, config.jwtSecret, { expiresIn: '1h' });

    // ──────────────────────────────────────────────────
    // TEST 1: Happy Path (Request -> PENDING -> Accept -> ACCEPTED -> Complete -> COMPLETED)
    // ──────────────────────────────────────────────────
    console.log('Test 1: Complete Happy Path Flow (PENDING -> ACCEPTED -> COMPLETED)');

    // Step A: Student A requests session
    const reqRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        providerId: studentB._id.toString(),
        skill: 'React Peer Session',
        date: '2026-09-01',
        time: '14:00',
        duration: '60 min',
        message: 'Looking forward to learning React hooks!',
      }
    );

    if (
      reqRes.status !== 201 ||
      reqRes.body.status !== 'success' ||
      reqRes.body.data.session.status !== 'pending'
    ) {
      throw new Error(`Session request creation failed: ${JSON.stringify(reqRes)}`);
    }

    const sessionId = reqRes.body.data.session._id;
    console.log('   ✓ Step 1: Session created with status PENDING. ID:', sessionId);

    // Step B: Student B accepts session
    const acceptRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
      },
      { status: 'accepted' }
    );

    if (
      acceptRes.status !== 200 ||
      acceptRes.body.status !== 'success' ||
      acceptRes.body.data.session.status !== 'accepted'
    ) {
      throw new Error(`Session acceptance failed: ${JSON.stringify(acceptRes)}`);
    }

    console.log('   ✓ Step 2: Student B accepted session. Status: ACCEPTED');

    // Step C: Complete session
    const completeRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      { status: 'completed' }
    );

    if (
      completeRes.status === 200 &&
      completeRes.body.status === 'success' &&
      completeRes.body.data.session.status === 'completed'
    ) {
      console.log('   ✅ PASSED — Full lifecycle verified: PENDING -> ACCEPTED -> COMPLETED.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Session completion step failed:', completeRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 2: Rejection Flow (Request -> PENDING -> Reject -> REJECTED)
    // ──────────────────────────────────────────────────
    console.log('\nTest 2: Rejection Flow (PENDING -> REJECTED)');
    const reqRes2 = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        providerId: studentB._id.toString(),
        skill: 'React Peer Session',
        date: '2026-09-02',
        time: '16:00',
        message: 'Can we meet for Python tutoring?',
      }
    );

    const sessionId2 = reqRes2.body.data.session._id;

    const rejectRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId2}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
      },
      { status: 'rejected' }
    );

    if (
      rejectRes.status === 200 &&
      rejectRes.body.status === 'success' &&
      rejectRes.body.data.session.status === 'rejected'
    ) {
      console.log('   ✅ PASSED — Provider rejected pending session. Status: REJECTED.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Rejection flow failed:', rejectRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 3: Cancellation Flow (Request -> PENDING -> Cancel -> CANCELLED)
    // ──────────────────────────────────────────────────
    console.log('\nTest 3: Cancellation Flow (PENDING -> CANCELLED)');
    const reqRes3 = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        providerId: studentB._id.toString(),
        skill: 'React Peer Session',
        date: '2026-09-03',
        time: '10:00',
        message: 'Reschedule test.',
      }
    );

    const sessionId3 = reqRes3.body.data.session._id;

    const cancelRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId3}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      { status: 'cancelled' }
    );

    if (
      cancelRes.status === 200 &&
      cancelRes.body.status === 'success' &&
      cancelRes.body.data.session.status === 'cancelled'
    ) {
      console.log('   ✅ PASSED — Requester cancelled session. Status: CANCELLED.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Cancellation flow failed:', cancelRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 4: Self-Request Prevention (Rule 1)
    // ──────────────────────────────────────────────────
    console.log('\nTest 4: Self-Request Prevention (requesterId === providerId)');
    const selfReqRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        providerId: studentA._id.toString(),
        skill: 'React Peer Session',
        date: '2026-09-04',
        time: '11:00',
      }
    );

    if (selfReqRes.status === 400 && selfReqRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Correctly rejected self-session request (400 Bad Request).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Self-request validation failed:', selfReqRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 5: Provider-Only Accept/Reject Authorization (Rule 3)
    // ──────────────────────────────────────────────────
    console.log('\nTest 5: Provider-Only Accept Authorization');
    const reqRes5 = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        providerId: studentB._id.toString(),
        skill: 'React Peer Session',
        date: '2026-09-05',
        time: '15:00',
      }
    );

    const sessionId5 = reqRes5.body.data.session._id;

    // Student A (Requester) tries to accept own request
    const illegalAcceptRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId5}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      { status: 'accepted' }
    );

    if (illegalAcceptRes.status === 403 && illegalAcceptRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Blocked requester from accepting own request (403 Forbidden).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Provider authorization failed:', illegalAcceptRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 6: Completion Only After Acceptance (Rule 5)
    // ──────────────────────────────────────────────────
    console.log('\nTest 6: Premature Completion Block (Completing PENDING session)');
    const prematureCompleteRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId5}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
      },
      { status: 'completed' }
    );

    if (prematureCompleteRes.status === 400 && prematureCompleteRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Rejected completing session before acceptance (400 Bad Request).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Premature completion block failed:', prematureCompleteRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 7: Participant Access Control (Rule 4)
    // ──────────────────────────────────────────────────
    console.log('\nTest 7: Third-Party Access Control (Student C access attempt)');
    const thirdPartyGetRes = await makeRequest({
      port: TEST_PORT,
      path: `/api/sessions/${sessionId5}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenC}`,
      },
    });

    const thirdPartyPutRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/sessions/${sessionId5}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenC}`,
        },
      },
      { status: 'cancelled' }
    );

    if (
      thirdPartyGetRes.status === 403 &&
      thirdPartyPutRes.status === 403 &&
      thirdPartyGetRes.body.status === 'fail'
    ) {
      console.log('   ✅ PASSED — Blocked non-participant Student C from viewing or updating session (403 Forbidden).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Participant access control check failed:', {
        get: thirdPartyGetRes.status,
        put: thirdPartyPutRes.status,
      });
    }

  } catch (err) {
    console.error('❌ Error executing session tests:', err);
  } finally {
    await User.deleteMany({ email: new RegExp(emailPrefix) });
    await Session.deleteMany({ skill: 'React Peer Session' });
    console.log('\n🧹 Cleaned up temporary test user and session documents from MongoDB.');

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

runSessionsApiTests();
