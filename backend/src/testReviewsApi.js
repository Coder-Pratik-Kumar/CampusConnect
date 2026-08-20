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
import Review from './models/Review.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Setup isolated express test server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', reviewRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const TEST_PORT = 5008;

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

async function runReviewsApiTests() {
  console.log('==================================================');
  console.log(' 🧪 REVIEWS & RATINGS API SUITE');
  console.log('==================================================\n');

  await connectDB();

  let server;
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const emailPrefix = `rev_test_${Date.now()}`;
  let passedCount = 0;
  const totalCount = 6;

  let studentA, studentB, studentC;
  let tokenA, tokenB, tokenC;
  let completedSession1, completedSession2, pendingSession;

  try {
    // Cleanup old test data
    await User.deleteMany({ email: new RegExp(emailPrefix) });
    await Session.deleteMany({ skill: 'Review Test Skill' });
    await Review.deleteMany({ comment: new RegExp('Review Test') });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);

    studentA = await User.create({
      name: 'Reviewer Student A',
      email: `${emailPrefix}_a@university.edu`,
      password: hashedPassword,
      college: 'MIT',
      rating: 5.0,
      reviewsCount: 0,
    });

    studentB = await User.create({
      name: 'Receiver Student B',
      email: `${emailPrefix}_b@university.edu`,
      password: hashedPassword,
      college: 'MIT',
      rating: 5.0,
      reviewsCount: 0,
    });

    studentC = await User.create({
      name: 'Third Party Student C',
      email: `${emailPrefix}_c@university.edu`,
      password: hashedPassword,
      college: 'Stanford',
      rating: 5.0,
      reviewsCount: 0,
    });

    tokenA = jwt.sign({ id: studentA._id.toString() }, config.jwtSecret, { expiresIn: '1h' });
    tokenB = jwt.sign({ id: studentB._id.toString() }, config.jwtSecret, { expiresIn: '1h' });
    tokenC = jwt.sign({ id: studentC._id.toString() }, config.jwtSecret, { expiresIn: '1h' });

    // Create a completed session between Student A (requester) & Student B (provider)
    completedSession1 = await Session.create({
      requesterId: studentA._id,
      providerId: studentB._id,
      skill: 'Review Test Skill',
      date: '2026-09-10',
      time: '10:00',
      status: 'completed',
    });

    // Create a second completed session between Student A & Student B
    completedSession2 = await Session.create({
      requesterId: studentA._id,
      providerId: studentB._id,
      skill: 'Review Test Skill 2',
      date: '2026-09-11',
      time: '11:00',
      status: 'completed',
    });

    // Create a pending session
    pendingSession = await Session.create({
      requesterId: studentA._id,
      providerId: studentB._id,
      skill: 'Review Test Skill Pending',
      date: '2026-09-12',
      time: '12:00',
      status: 'pending',
    });

    // ──────────────────────────────────────────────────
    // TEST 1: Valid Review Submission
    // ──────────────────────────────────────────────────
    console.log('Test 1: Valid Review Submission for Completed Session');
    const validRevRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        sessionId: completedSession1._id.toString(),
        rating: 5,
        comment: 'Review Test: Excellent session, very knowledgeable!',
      }
    );

    if (
      validRevRes.status === 201 &&
      validRevRes.body.status === 'success' &&
      validRevRes.body.data.review.rating === 5 &&
      validRevRes.body.data.receiverMetrics.rating === 5 &&
      validRevRes.body.data.receiverMetrics.reviewsCount === 1
    ) {
      console.log('   ✅ PASSED — Review created (HTTP 201). Receiver rating set to 5.0 (1 review).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Valid review test:', validRevRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 2: Invalid Rating (Out of bounds: 0 or 6)
    // ──────────────────────────────────────────────────
    console.log('\nTest 2: Invalid Rating Validation (rating = 6)');
    const invalidRatingRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        sessionId: completedSession2._id.toString(),
        rating: 6,
        comment: 'Review Test: Rating out of bounds test.',
      }
    );

    if (invalidRatingRes.status === 400 && invalidRatingRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Rejected invalid rating 6 (400 Bad Request).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Invalid rating test:', invalidRatingRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 3: Review Before Session Completion
    // ──────────────────────────────────────────────────
    console.log('\nTest 3: Review Before Session Completion (Pending session)');
    const prematureRevRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        sessionId: pendingSession._id.toString(),
        rating: 4,
        comment: 'Review Test: Premature review test.',
      }
    );

    if (prematureRevRes.status === 400 && prematureRevRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Rejected review for pending session (400 Bad Request).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Premature review test:', prematureRevRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 4: Duplicate Review Prevention
    // ──────────────────────────────────────────────────
    console.log('\nTest 4: Duplicate Review Block (Same session & reviewer)');
    const dupRevRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        sessionId: completedSession1._id.toString(),
        rating: 4,
        comment: 'Review Test: Duplicate review submission test.',
      }
    );

    if (dupRevRes.status === 400 && dupRevRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Blocked duplicate review for same session (400 Bad Request).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Duplicate review test:', dupRevRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 5: Unauthorized Review (Non-participant)
    // ──────────────────────────────────────────────────
    console.log('\nTest 5: Unauthorized Review Block (Non-participant Student C)');
    const unauthRevRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenC}`,
        },
      },
      {
        sessionId: completedSession2._id.toString(),
        rating: 5,
        comment: 'Review Test: Non-participant review test.',
      }
    );

    if (unauthRevRes.status === 403 && unauthRevRes.body.status === 'fail') {
      console.log('   ✅ PASSED — Blocked non-participant Student C (403 Forbidden).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Unauthorized review test:', unauthRevRes);
    }

    // ──────────────────────────────────────────────────
    // TEST 6: Average Rating Calculation
    // ──────────────────────────────────────────────────
    console.log('\nTest 6: Average Rating Calculation');
    // Student A submits a second review (3 stars) for completedSession2 with Student B
    const secondRevRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        sessionId: completedSession2._id.toString(),
        rating: 3,
        comment: 'Review Test: Second review to test average rating calculation.',
      }
    );

    // Fetch Student B's reviews via GET /api/users/:id/reviews
    const getReviewsRes = await makeRequest({
      port: TEST_PORT,
      path: `/api/users/${studentB._id.toString()}/reviews`,
      method: 'GET',
    });

    const updatedUserB = await User.findById(studentB._id);

    if (
      secondRevRes.status === 201 &&
      getReviewsRes.status === 200 &&
      getReviewsRes.body.data.reviews.length === 2 &&
      updatedUserB.rating === 4 && // (5 + 3) / 2 = 4.0
      updatedUserB.reviewsCount === 2
    ) {
      console.log('   ✅ PASSED — Average rating computed to 4.0 across 2 reviews (5 + 3 / 2).');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Average rating calculation test:', {
        secondRevRes: secondRevRes.status,
        getReviewsRes: getReviewsRes.status,
        updatedUserBRating: updatedUserB ? updatedUserB.rating : null,
      });
    }

  } catch (err) {
    console.error('❌ Error executing review tests:', err);
  } finally {
    await User.deleteMany({ email: new RegExp(emailPrefix) });
    await Session.deleteMany({ skill: 'Review Test Skill' });
    await Review.deleteMany({ comment: new RegExp('Review Test') });
    console.log('\n🧹 Cleaned up temporary test user, session, and review documents from MongoDB.');

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

runReviewsApiTests();
