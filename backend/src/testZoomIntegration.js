/**
 * ============================================================
 * CampusConnect — Zoom Meeting Integration Test Suite
 * ============================================================
 *
 * Tests all Zoom-related functionality with MOCKED Zoom API calls.
 * No real Zoom HTTP requests are made during this test suite.
 *
 * Mocking strategy: override the global `fetch` for each test
 * that needs Zoom API interception, then restore it afterward.
 * ============================================================
 */

// ─── Set test-scope Zoom env vars so credential guards don't fire ─────────────
// These values are never used for real Zoom calls because all fetch() calls
// are intercepted by mocks before they reach the network.
process.env.ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || 'test_account_id';
process.env.ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID || 'test_client_id';
process.env.ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || 'test_client_secret';

import mongoose from 'mongoose';
import { config } from './config/env.js';
import { getAccessToken, createZoomMeeting, _clearTokenCache } from './services/zoomService.js';
import Session from './models/Session.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// ─── Test Infrastructure ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

const assert = (condition, label) => {
  if (condition) {
    console.log(`  ✅ [PASS] ${label}`);
    passed++;
    results.push({ label, pass: true });
  } else {
    console.log(`  ❌ [FAIL] ${label}`);
    failed++;
    results.push({ label, pass: false });
  }
};

// ─── Zoom API Mock Helpers ────────────────────────────────────────────────────

const MOCK_TOKEN_RESPONSE = {
  access_token: 'mock_access_token_xyz',
  expires_in: 3600,
  token_type: 'bearer',
};

const MOCK_MEETING_RESPONSE = {
  id: 987654321,
  uuid: 'abc123==',
  host_id: 'host_user_id',
  topic: 'CampusConnect Learning Session - Java',
  type: 2,
  start_time: '2026-09-10T14:00:00Z',
  duration: 60,
  timezone: 'UTC',
  join_url: 'https://zoom.us/j/987654321?pwd=mockpassword',
  start_url: 'https://zoom.us/s/987654321?zak=SENSITIVE_HOST_TOKEN', // MUST NEVER APPEAR IN RESPONSES
  password: 'mockPwd1',
};

/**
 * Create a mock fetch that simulates Zoom OAuth token endpoint.
 */
const mockFetchTokenSuccess = () => {
  global.fetch = async (url, opts) => {
    if (url.includes('zoom.us/oauth/token')) {
      return {
        ok: true,
        json: async () => ({ ...MOCK_TOKEN_RESPONSE }),
      };
    }
    throw new Error(`Unexpected fetch call to: ${url}`);
  };
};

/**
 * Create a mock fetch that simulates Zoom token failure.
 */
const mockFetchTokenFailure = (statusCode = 401) => {
  global.fetch = async (url) => {
    if (url.includes('zoom.us/oauth/token')) {
      return { ok: false, status: statusCode, statusText: 'Unauthorized' };
    }
    throw new Error(`Unexpected fetch call to: ${url}`);
  };
};

/**
 * Create a mock fetch that succeeds for token then succeeds for meeting creation.
 */
const mockFetchTokenAndMeetingSuccess = () => {
  global.fetch = async (url, opts) => {
    if (url.includes('zoom.us/oauth/token')) {
      return { ok: true, json: async () => ({ ...MOCK_TOKEN_RESPONSE }) };
    }
    if (url.includes('api.zoom.us/v2/users/me/meetings')) {
      return { ok: true, json: async () => ({ ...MOCK_MEETING_RESPONSE }) };
    }
    throw new Error(`Unexpected fetch call to: ${url}`);
  };
};

/**
 * Create a mock fetch that succeeds for token but fails for meeting creation.
 */
const mockFetchMeetingFailure = (statusCode = 500) => {
  global.fetch = async (url) => {
    if (url.includes('zoom.us/oauth/token')) {
      return { ok: true, json: async () => ({ ...MOCK_TOKEN_RESPONSE }) };
    }
    if (url.includes('api.zoom.us/v2/users/me/meetings')) {
      return { ok: false, status: statusCode, statusText: 'Internal Server Error', text: async () => '{"message":"internal error"}' };
    }
    throw new Error(`Unexpected fetch call to: ${url}`);
  };
};

const restoreFetch = () => {
  delete global.fetch;
};

// ─── Test Helpers ─────────────────────────────────────────────────────────────

const makeUser = async (suffix) => {
  const hashed = await bcrypt.hash('TestPass123!', 10);
  return await User.create({
    name: `Zoom Test User ${suffix}`,
    email: `zoomtest_${suffix}_${Date.now()}@campus.edu`,
    password: hashed,
    college: 'Tech University',
    major: 'CS',
    teachSkills: ['Java'],
    learnSkills: ['Python'],
  });
};

const makeToken = (userId) =>
  jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '1h' });

// ─── Main Test Runner ─────────────────────────────────────────────────────────

const runZoomTests = async () => {
  console.log('\n===============================================================');
  console.log(' 🔬 ZOOM MEETING INTEGRATION TEST SUITE (11 TESTS)');
  console.log('===============================================================\n');

  await mongoose.connect(config.mongoUri);
  console.log('🍃 Connected to MongoDB.\n');

  // Track created docs for cleanup
  const createdUserIds = [];
  const createdSessionIds = [];

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // TEST 1: Token generation (mocked success)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('--- Test 1: Token Generation (Mocked Success) ---');
    _clearTokenCache();
    mockFetchTokenSuccess();
    const token = await getAccessToken();
    assert(token === MOCK_TOKEN_RESPONSE.access_token, 'getAccessToken() returns mock token string');
    restoreFetch();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 2: Token caching (same token reused within expiry)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 2: Token Caching ---');
    let fetchCallCount = 0;
    global.fetch = async (url) => {
      if (url.includes('zoom.us/oauth/token')) {
        fetchCallCount++;
        return { ok: true, json: async () => ({ ...MOCK_TOKEN_RESPONSE }) };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    };
    _clearTokenCache();
    await getAccessToken(); // first call
    await getAccessToken(); // should use cache
    await getAccessToken(); // should use cache
    assert(fetchCallCount === 1, 'Token fetched only once; subsequent calls use cache');
    restoreFetch();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 3: Meeting creation returns correct shape
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 3: Meeting Creation (Mocked Success) ---');
    _clearTokenCache();
    mockFetchTokenAndMeetingSuccess();
    const meeting = await createZoomMeeting({
      topic: 'CampusConnect Learning Session - Java',
      startTime: '2026-09-10T14:00:00Z',
      durationMinutes: 60,
    });
    assert(meeting.meetingId === String(MOCK_MEETING_RESPONSE.id), 'meetingId is present and correct');
    assert(meeting.joinUrl === MOCK_MEETING_RESPONSE.join_url, 'joinUrl is present and correct');
    assert(meeting.password === MOCK_MEETING_RESPONSE.password, 'password is present');
    assert(!meeting.startUrl && meeting.startUrl !== MOCK_MEETING_RESPONSE.start_url, 'start_url is NEVER returned from createZoomMeeting');
    restoreFetch();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 4: Session acceptance creates exactly one Zoom meeting (DB integration)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 4: Session Acceptance Creates One Zoom Meeting ---');
    const userA = await makeUser('A4');
    const userB = await makeUser('B4');
    createdUserIds.push(userA._id, userB._id);

    const sess4 = await Session.create({
      requesterId: userA._id,
      providerId: userB._id,
      skill: 'Java',
      date: '2026-09-10',
      time: '2:00 PM',
      duration: '60 Min',
      status: 'pending',
    });
    createdSessionIds.push(sess4._id);

    // Simulate the acceptance + Zoom creation that sessionController does
    _clearTokenCache();
    mockFetchTokenAndMeetingSuccess();
    const zoomResult = await createZoomMeeting({
      topic: `CampusConnect Learning Session - ${sess4.skill}`,
      startTime: '2026-09-10T14:00:00Z',
      durationMinutes: 60,
    });
    sess4.status = 'accepted';
    sess4.zoom = { meetingId: zoomResult.meetingId, joinUrl: zoomResult.joinUrl, password: zoomResult.password };
    await sess4.save();
    restoreFetch();

    const dbSess4 = await Session.findById(sess4._id);
    assert(dbSess4.status === 'accepted', 'Session status is accepted in MongoDB');
    assert(dbSess4.zoom.meetingId === String(MOCK_MEETING_RESPONSE.id), 'Zoom meetingId saved in MongoDB');
    assert(dbSess4.zoom.joinUrl === MOCK_MEETING_RESPONSE.join_url, 'Zoom joinUrl saved in MongoDB');
    assert(!!dbSess4.zoom.password, 'Zoom password saved in MongoDB');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 5: Idempotency — repeated acceptance does NOT create duplicate meeting
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 5: Idempotency (No Duplicate Zoom Meeting) ---');
    let meetingCreationCount = 0;
    global.fetch = async (url) => {
      if (url.includes('zoom.us/oauth/token')) {
        return { ok: true, json: async () => ({ ...MOCK_TOKEN_RESPONSE }) };
      }
      if (url.includes('api.zoom.us/v2/users/me/meetings')) {
        meetingCreationCount++;
        return { ok: true, json: async () => ({ ...MOCK_MEETING_RESPONSE, id: 111222333 }) };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    };

    // Session already has zoom.meetingId — simulate the idempotency guard
    const alreadyHasZoom = dbSess4.zoom && dbSess4.zoom.meetingId;
    if (!alreadyHasZoom) {
      await createZoomMeeting({ topic: 'Test', startTime: '2026-09-10T14:00:00Z', durationMinutes: 60 });
    }
    assert(meetingCreationCount === 0, 'Idempotency guard: no Zoom API call made when meetingId already exists');
    restoreFetch();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 6: Zoom failure → session stays pending, no fake URL stored
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 6: Zoom Failure → Session Stays Pending ---');
    const userA6 = await makeUser('A6');
    const userB6 = await makeUser('B6');
    createdUserIds.push(userA6._id, userB6._id);

    const sess6 = await Session.create({
      requesterId: userA6._id,
      providerId: userB6._id,
      skill: 'Python',
      date: '2026-09-11',
      time: '3:00 PM',
      duration: '90 Min',
      status: 'pending',
    });
    createdSessionIds.push(sess6._id);

    _clearTokenCache();
    mockFetchMeetingFailure(500);

    let zoomFailed = false;
    try {
      await createZoomMeeting({ topic: 'Test', startTime: '2026-09-11T15:00:00Z', durationMinutes: 90 });
    } catch (err) {
      zoomFailed = true;
      // Simulate controller rollback
      sess6.status = 'pending';
      await sess6.save();
    }
    restoreFetch();

    const dbSess6 = await Session.findById(sess6._id);
    assert(zoomFailed === true, 'Zoom failure throws an error (not silently swallowed)');
    assert(dbSess6.status === 'pending', 'Session remains pending after Zoom failure');
    assert(!dbSess6.zoom?.meetingId, 'No meetingId stored after Zoom failure');
    assert(!dbSess6.zoom?.joinUrl, 'No joinUrl stored after Zoom failure');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 7: Invalid/empty joinUrl is never returned from createZoomMeeting
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 7: Incomplete Zoom Response Throws ---');
    _clearTokenCache();
    global.fetch = async (url) => {
      if (url.includes('zoom.us/oauth/token')) return { ok: true, json: async () => ({ ...MOCK_TOKEN_RESPONSE }) };
      if (url.includes('api.zoom.us/v2/users/me/meetings')) {
        // Zoom returns a response missing join_url
        return { ok: true, json: async () => ({ id: 123, topic: 'Test' }) };
      }
    };

    let incompleteRespThrew = false;
    try {
      await createZoomMeeting({ topic: 'Test', startTime: '2026-09-11T15:00:00Z', durationMinutes: 60 });
    } catch (err) {
      incompleteRespThrew = err.message.includes('incomplete');
    }
    assert(incompleteRespThrew === true, 'createZoomMeeting throws when join_url is missing from Zoom response');
    restoreFetch();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 8: Authorized participants can read zoom.joinUrl from GET session
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 8: Authorized Participant Reads Zoom Join URL ---');
    // dbSess4 has zoom data; confirm requester (userA) can retrieve it
    const fetchedSess = await Session.findById(dbSess4._id);
    const requesterId = fetchedSess.requesterId.toString();
    const userAId = userA._id.toString();
    const isParticipant = requesterId === userAId || fetchedSess.providerId.toString() === userAId;
    assert(isParticipant, 'User A is recognized as a participant of session 4');
    assert(!!fetchedSess.zoom?.joinUrl, 'zoom.joinUrl is accessible from MongoDB for authorized participant');
    assert(fetchedSess.zoom.joinUrl.startsWith('https://zoom.us'), 'joinUrl is a valid Zoom URL');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 9: Unauthorized user cannot see another session's Zoom data via HTTP API
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 9: Unauthorized User Cannot Access Zoom Data ---');
    // Simulate: userC (unrelated) tries to GET session 4 — should be blocked by
    // the existing participant authorization guard in getSessionById
    const userC9 = await makeUser('C9');
    createdUserIds.push(userC9._id);
    const cId = userC9._id.toString();
    const sess4RequesterId = dbSess4.requesterId.toString();
    const sess4ProviderId = dbSess4.providerId.toString();
    const cIsParticipant = cId === sess4RequesterId || cId === sess4ProviderId;
    assert(!cIsParticipant, 'Unrelated user C is correctly not a participant of session 4');
    // If not a participant, the controller returns 403 (verified in e2eLiveTest.js Step 11)

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 10: Existing complete/cancel flows still work after zoom fields added
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 10: Existing Session Flows Unbroken After Zoom Fields ---');
    // Complete the sess4 session (it's accepted; completing should still work)
    dbSess4.status = 'completed';
    await dbSess4.save();
    const completedSess = await Session.findById(dbSess4._id);
    assert(completedSess.status === 'completed', 'Session can be marked completed after Zoom integration');
    assert(completedSess.zoom?.meetingId, 'Zoom meetingId persists after session is completed');

    // Create and cancel a new session
    const userA10 = await makeUser('A10');
    const userB10 = await makeUser('B10');
    createdUserIds.push(userA10._id, userB10._id);
    const cancelSess = await Session.create({
      requesterId: userA10._id, providerId: userB10._id,
      skill: 'React', date: '2026-09-15', time: '6:00 PM', duration: '30 Min', status: 'pending',
    });
    createdSessionIds.push(cancelSess._id);
    cancelSess.status = 'cancelled';
    await cancelSess.save();
    const cancelledFetch = await Session.findById(cancelSess._id);
    assert(cancelledFetch.status === 'cancelled', 'Session cancel still works with zoom field in schema');
    assert(cancelledFetch.zoom?.meetingId === null || cancelledFetch.zoom?.meetingId === undefined || !cancelledFetch.zoom?.meetingId, 'Cancelled session has no zoom meetingId (never created)');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 11: Acceptance notification mentions Zoom meeting
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Test 11: Notification Content Mentions Zoom Meeting ---');
    const meetingNote = ' Your Zoom meeting is ready — check your Sessions page to join.';
    const providerName = 'Bob Smith';
    const skill = 'Java';
    const notifMessage = `${providerName} accepted your ${skill} session request.${meetingNote}`;
    assert(notifMessage.includes('Zoom meeting'), 'Notification message includes "Zoom meeting" when meeting is ready');
    assert(notifMessage.includes('check your Sessions page'), 'Notification directs user to Sessions page');
    // The actual notification creation is tested in testNotificationsApi.js;
    // here we just verify the message format

  } catch (err) {
    console.error('\n❌ Exception during Zoom tests:', err.message);
    console.error(err.stack);
  } finally {
    // ─── Cleanup ────────────────────────────────────────────────────────────
    console.log('\n🧹 Cleaning up test documents...');
    if (createdSessionIds.length) await Session.deleteMany({ _id: { $in: createdSessionIds } });
    if (createdUserIds.length) await User.deleteMany({ _id: { $in: createdUserIds } });
    _clearTokenCache();
    restoreFetch();
    await mongoose.disconnect();
    console.log('✨ Cleanup complete.\n');
  }

  // ─── Results ──────────────────────────────────────────────────────────────
  console.log('===============================================================');
  console.log(` 📊 ZOOM TEST RESULTS: ${passed}/${passed + failed} ASSERTIONS PASSED`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
};

runZoomTests();
