import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import matchRoutes from './routes/matchRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Setup isolated express test server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/matches', matchRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const TEST_PORT = 5006;

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

async function runMatchingTests() {
  console.log('==================================================');
  console.log(' 🧪 RULE-BASED MATCHING ENGINE API TEST SUITE');
  console.log('==================================================\n');

  await connectDB();

  let server;
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const testEmailPrefix = `match_test_${Date.now()}`;
  let passedCount = 0;
  const totalCount = 7;

  let authUser, perfectPeer, partialPeer, sameCollegePeer, differentCollegePeer, availPeer, noMatchPeer;
  let validToken;

  try {
    // 0. Clean up old test users
    await User.deleteMany({ email: new RegExp(testEmailPrefix) });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);

    // 1. Authenticated User (User A)
    // Teaches: React, Node.js
    // Wants to learn: Python, UI/UX
    // College: MIT
    // Availability: Monday 09:00 - 11:00
    authUser = await User.create({
      name: 'User A (Auth)',
      email: `${testEmailPrefix}_auth@mit.edu`,
      password: hashedPassword,
      college: 'MIT',
      major: 'CS',
      teachSkills: ['React', 'Node.js'],
      learnSkills: ['Python', 'UI/UX'],
      availability: [{ day: 'Monday', startTime: '09:00', endTime: '11:00' }],
    });

    validToken = jwt.sign({ id: authUser._id.toString() }, config.jwtSecret, {
      expiresIn: '1h',
    });

    // 2. Perfect Peer (100 Points):
    // Teaches: Python (User A wants) -> +50
    // Wants to learn: React (User A teaches) -> +30
    // College: MIT (Same college) -> +10
    // Availability: Monday 10:00 - 12:00 (Overlaps 10:00-11:00) -> +10
    // Total = 100 points
    perfectPeer = await User.create({
      name: 'Perfect Peer',
      email: `${testEmailPrefix}_perfect@mit.edu`,
      password: hashedPassword,
      college: 'MIT',
      major: 'CS',
      teachSkills: ['Python', 'Machine Learning'],
      learnSkills: ['React', 'TypeScript'],
      availability: [{ day: 'Monday', startTime: '10:00', endTime: '12:00' }],
    });

    // 3. Partial Peer (80 Points):
    // Teaches: Python (User A wants) -> +50
    // Wants to learn: React (User A teaches) -> +30
    // College: Harvard (Different college) -> 0
    // Availability: Tuesday 14:00 - 16:00 (No overlap) -> 0
    // Total = 80 points
    partialPeer = await User.create({
      name: 'Partial Peer',
      email: `${testEmailPrefix}_partial@harvard.edu`,
      password: hashedPassword,
      college: 'Harvard',
      major: 'Physics',
      teachSkills: ['Python'],
      learnSkills: ['React'],
      availability: [{ day: 'Tuesday', startTime: '14:00', endTime: '16:00' }],
    });

    // 4. Same College Peer (+10 Points from college only):
    // Teaches: Go (User A does not want) -> 0
    // Wants to learn: Ruby (User A does not teach) -> 0
    // College: MIT (Same college) -> +10
    // Availability: Friday 09:00 - 11:00 (No overlap) -> 0
    // Total = 10 points
    sameCollegePeer = await User.create({
      name: 'Same College Peer',
      email: `${testEmailPrefix}_samecollege@mit.edu`,
      password: hashedPassword,
      college: 'MIT',
      major: 'Biology',
      teachSkills: ['Go'],
      learnSkills: ['Ruby'],
      availability: [{ day: 'Friday', startTime: '09:00', endTime: '11:00' }],
    });

    // 5. Different College Peer (+50 Points from skill, 0 from college):
    // Teaches: UI/UX (User A wants) -> +50
    // Wants to learn: C++ (User A does not teach) -> 0
    // College: Stanford (Different) -> 0
    // Availability: Wednesday -> 0
    // Total = 50 points
    differentCollegePeer = await User.create({
      name: 'Diff College Peer',
      email: `${testEmailPrefix}_diffcollege@stanford.edu`,
      password: hashedPassword,
      college: 'Stanford',
      major: 'Design',
      teachSkills: ['UI/UX'],
      learnSkills: ['C++'],
      availability: [{ day: 'Wednesday', startTime: '09:00', endTime: '11:00' }],
    });

    // 6. Availability Overlap Peer (+10 Points from availability only):
    // Teaches: Rust (User A does not want) -> 0
    // Wants to learn: Swift (User A does not teach) -> 0
    // College: Yale (Different) -> 0
    // Availability: Monday 08:30 - 09:30 (Overlaps Monday 09:00-09:30) -> +10
    // Total = 10 points
    availPeer = await User.create({
      name: 'Availability Peer',
      email: `${testEmailPrefix}_avail@yale.edu`,
      password: hashedPassword,
      college: 'Yale',
      major: 'Math',
      teachSkills: ['Rust'],
      learnSkills: ['Swift'],
      availability: [{ day: 'Monday', startTime: '08:30', endTime: '09:30' }],
    });

    // 7. No Match Peer (0 Points):
    // Teaches: Java -> 0
    // Wants to learn: PHP -> 0
    // College: Oxford -> 0
    // Availability: Sunday -> 0
    // Total = 0 points
    noMatchPeer = await User.create({
      name: 'No Match Peer',
      email: `${testEmailPrefix}_nomatch@oxford.edu`,
      password: hashedPassword,
      college: 'Oxford',
      major: 'History',
      teachSkills: ['Java'],
      learnSkills: ['PHP'],
      availability: [{ day: 'Sunday', startTime: '12:00', endTime: '14:00' }],
    });

    // Make HTTP Request to GET /api/matches
    console.log('Sending GET /api/matches with valid JWT...');
    const response = await makeRequest({
      port: TEST_PORT,
      path: '/api/matches',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    if (response.status !== 200 || response.body.status !== 'success') {
      throw new Error(`API failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    const { user, totalMatches, matches } = response.body.data;
    console.log(`Received ${totalMatches} total match candidates.\n`);

    // Helper to find match object by peer name
    const findMatch = (name) => matches.find((m) => m.user.name === name);

    // ──────────────────────────────────────────────────
    // TEST 1: Perfect Match (100 Score)
    // ──────────────────────────────────────────────────
    console.log('Test 1: Perfect Match Scoring (100 Points)');
    const perfectMatch = findMatch('Perfect Peer');
    if (
      perfectMatch &&
      perfectMatch.matchScore === 100 &&
      perfectMatch.reasons.length === 4
    ) {
      console.log('   ✅ PASSED — Perfect match calculated 100 points with 4 reasons.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Perfect match calculation:', perfectMatch);
    }

    // ──────────────────────────────────────────────────
    // TEST 2: Partial Match (80 Score)
    // ──────────────────────────────────────────────────
    console.log('\nTest 2: Partial Match Scoring (80 Points)');
    const partialMatch = findMatch('Partial Peer');
    if (
      partialMatch &&
      partialMatch.matchScore === 80 &&
      partialMatch.reasons.length === 2
    ) {
      console.log('   ✅ PASSED — Reciprocal skill match score calculated 80 points.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Partial match calculation:', partialMatch);
    }

    // ──────────────────────────────────────────────────
    // TEST 3: Same College (+10 Points)
    // ──────────────────────────────────────────────────
    console.log('\nTest 3: Same College Scoring (+10 Points)');
    const sameCollegeMatch = findMatch('Same College Peer');
    if (
      sameCollegeMatch &&
      sameCollegeMatch.matchScore === 10 &&
      sameCollegeMatch.reasons.some((r) => r.includes('Both students attend MIT'))
    ) {
      console.log('   ✅ PASSED — Same college reason and +10 score verified.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Same college calculation:', sameCollegeMatch);
    }

    // ──────────────────────────────────────────────────
    // TEST 4: Different College (+0 Points from college)
    // ──────────────────────────────────────────────────
    console.log('\nTest 4: Different College Handling');
    const diffCollegeMatch = findMatch('Diff College Peer');
    if (
      diffCollegeMatch &&
      diffCollegeMatch.matchScore === 50 &&
      !diffCollegeMatch.reasons.some((r) => r.includes('attend'))
    ) {
      console.log('   ✅ PASSED — Different college correctly yielded 0 college points.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Different college calculation:', diffCollegeMatch);
    }

    // ──────────────────────────────────────────────────
    // TEST 5: Availability Overlap (+10 Points)
    // ──────────────────────────────────────────────────
    console.log('\nTest 5: Availability Overlap Scoring (+10 Points)');
    const availMatch = findMatch('Availability Peer');
    if (
      availMatch &&
      availMatch.matchScore === 10 &&
      availMatch.reasons.some((r) => r.includes('Compatible schedule availability on Monday'))
    ) {
      console.log('   ✅ PASSED — Overlapping schedule on Monday awarded +10 points.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Availability overlap calculation:', availMatch);
    }

    // ──────────────────────────────────────────────────
    // TEST 6: No Match (0 Points)
    // ──────────────────────────────────────────────────
    console.log('\nTest 6: No Match Candidate (0 Points)');
    const noMatch = findMatch('No Match Peer');
    if (
      noMatch &&
      noMatch.matchScore === 0 &&
      noMatch.reasons.some((r) => r.includes('No direct skill'))
    ) {
      console.log('   ✅ PASSED — Candidate with no matching criteria received 0 score & default reason.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — No match calculation:', noMatch);
    }

    // ──────────────────────────────────────────────────
    // TEST 7: Self-Match Prevention & Sorting
    // ──────────────────────────────────────────────────
    console.log('\nTest 7: Self-Match Prevention & Descending Sorting');
    const selfInMatches = matches.some((m) => m.user.id.toString() === authUser._id.toString());
    const isSorted = matches.every((m, i) => i === 0 || matches[i - 1].matchScore >= m.matchScore);

    if (!selfInMatches && isSorted) {
      console.log('   ✅ PASSED — Authenticated user excluded from results and matches sorted descending.');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Self-match or sorting check:', { selfInMatches, isSorted });
    }

  } catch (err) {
    console.error('❌ Error executing matching tests:', err);
  } finally {
    // Cleanup test users
    await User.deleteMany({ email: new RegExp(testEmailPrefix) });
    console.log('\n🧹 Cleaned up temporary test user documents from MongoDB.');

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

runMatchingTests();
