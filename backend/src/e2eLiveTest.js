import http from 'http';
import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';
import { config } from './config/env.js';

const BASE_HOST = '127.0.0.1';
const BASE_PORT = 5000;

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const postData = body ? JSON.stringify(body) : null;
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const request = http.request(
      {
        hostname: BASE_HOST,
        port: BASE_PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve({ status: res.statusCode, body: data });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );

    request.on('error', (err) => reject(err));
    if (postData) {
      request.write(postData);
    }
    request.end();
  });
}

async function runLiveE2ETests() {
  console.log('===============================================================');
  console.log(' 🔬 CAMPUSCONNECT LIVE END-TO-END SYSTEM TEST (SECTIONS 4 - 12)');
  console.log('===============================================================\n');

  await mongoose.connect(config.mongoUri);
  console.log('🍃 Connected to MongoDB for database state validation.\n');

  const stamp = Date.now();
  const emailA = `e2e_usera_${stamp}@campus.edu`;
  const emailB = `e2e_userb_${stamp}@campus.edu`;
  const emailC = `e2e_userc_${stamp}@campus.edu`;
  const password = 'Password123!';

  let userA, userB, userC;
  let tokenA, tokenB, tokenC;
  let sessionId, cancelSessionId, rejectSessionId;
  let passedAssertions = 0;
  let totalAssertions = 0;

  function assert(condition, message) {
    totalAssertions++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedAssertions++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // ==================================================
    // 4. USER A & USER B REGISTRATION & PROFILE SETUP
    // ==================================================
    console.log('--- Step 4: User A / User B Registration, Login & Skills Setup ---');

    // Register User A
    const regA = await req('POST', '/api/auth/register', {
      name: 'Alice Johnson',
      email: emailA,
      password: password,
      college: 'GLA University',
    });
    assert(regA.status === 201 && regA.body.status === 'success', 'User A registered (HTTP 201)');
    tokenA = regA.body.data.token;
    userA = regA.body.data.user;

    // Register User B
    const regB = await req('POST', '/api/auth/register', {
      name: 'Bob Smith',
      email: emailB,
      password: password,
      college: 'GLA University',
    });
    assert(regB.status === 201 && regB.body.status === 'success', 'User B registered (HTTP 201)');
    tokenB = regB.body.data.token;
    userB = regB.body.data.user;

    // Register User C (for authorization testing)
    const regC = await req('POST', '/api/auth/register', {
      name: 'Charlie Brown',
      email: emailC,
      password: password,
      college: 'Other Institute',
    });
    assert(regC.status === 201 && regC.body.status === 'success', 'User C registered (HTTP 201)');
    tokenC = regC.body.data.token;
    userC = regC.body.data.user;

    // Login User A
    const loginA = await req('POST', '/api/auth/login', {
      email: emailA,
      password: password,
    });
    assert(loginA.status === 200 && loginA.body.data.token, 'User A logged in successfully');
    tokenA = loginA.body.data.token;

    // Login User B
    const loginB = await req('POST', '/api/auth/login', {
      email: emailB,
      password: password,
    });
    assert(loginB.status === 200 && loginB.body.data.token, 'User B logged in successfully');
    tokenB = loginB.body.data.token;

    // Login User C
    const loginC = await req('POST', '/api/auth/login', {
      email: emailC,
      password: password,
    });
    assert(loginC.status === 200 && loginC.body.data.token, 'User C logged in successfully');
    tokenC = loginC.body.data.token;

    // User A updates profile with skills: teach Python, learn React
    const updateA = await req(
      'PUT',
      '/api/profile',
      {
        name: 'Alice Johnson',
        bio: 'Python enthusiast and data science learner',
        college: 'GLA University',
        major: 'Computer Science',
        teachSkills: ['Python', 'Data Science'],
        learnSkills: ['React', 'TypeScript'],
        availability: [{ day: 'Tuesday', startTime: '10:00 AM', endTime: '12:00 PM' }],
      },
      tokenA
    );
    assert(updateA.status === 200 && updateA.body.data.user.teachSkills.includes('Python'), 'User A teach/learn skills updated');

    // User B updates profile with complementary skills: teach React, learn Python
    const updateB = await req(
      'PUT',
      '/api/profile',
      {
        name: 'Bob Smith',
        bio: 'Frontend developer and React tutor',
        college: 'GLA University',
        major: 'Computer Science',
        teachSkills: ['React', 'CSS'],
        learnSkills: ['Python', 'Machine Learning'],
        availability: [{ day: 'Tuesday', startTime: '10:00 AM', endTime: '12:00 PM' }],
      },
      tokenB
    );
    assert(updateB.status === 200 && updateB.body.data.user.teachSkills.includes('React'), 'User B complementary skills updated');

    // Verify persistence in MongoDB
    const docA = await User.findById(userA.id || userA._id);
    const docB = await User.findById(userB.id || userB._id);
    assert(docA.teachSkills.includes('Python') && docB.teachSkills.includes('React'), 'MongoDB confirmed persistence for skills');

    // ==================================================
    // 5. MATCHING TEST
    // ==================================================
    console.log('\n--- Step 5: Matching Engine Test ---');
    const bId = (userB.id || userB._id).toString();
    const matchesA = await req('GET', '/api/matches', null, tokenA);
    assert(matchesA.status === 200 && Array.isArray(matchesA.body.data.matches), 'GET /api/matches returns array');
    
    const matchedB = matchesA.body.data.matches.find((m) => (m.user?.id || m.user?._id || '').toString() === bId);
    assert(!!matchedB, 'User B found in User A matches');
    if (matchedB) {
      assert(matchedB.matchScore >= 80, `User B match score is high (${matchedB.matchScore}) due to reciprocal skill match`);
      assert(Array.isArray(matchedB.reasons) && matchedB.reasons.length > 0, `Match reasons provided: "${matchedB.reasons.join(', ')}"`);
      assert(matchedB.user.teachSkills.includes('React'), 'Matched user teachSkills contains real skill');
    }

    // ==================================================
    // 6. PEER PROFILE TEST
    // ==================================================
    console.log('\n--- Step 6: Peer Profile Test ---');
    const peerRes = await req('GET', `/api/profile/${bId}`, null, tokenA);
    assert(peerRes.status === 200 && peerRes.body.data.user, 'GET /api/profile/:id returns peer profile');
    assert(peerRes.body.data.user.name === 'Bob Smith', 'Peer name matches real DB data');
    assert(peerRes.body.data.user.teachSkills.includes('React'), 'Peer teachSkills matches real DB data');
    assert(!peerRes.body.data.user.password, 'Peer profile does not leak password hash');

    // ==================================================
    // 7. SESSION TEST (REQUEST, ACCEPT, REJECT, COMPLETE)
    // ==================================================
    console.log('\n--- Step 7: Session Lifecycle & Persistence Test ---');

    // User A requests session with User B
    const sessReq = await req(
      'POST',
      '/api/sessions',
      {
        providerId: bId,
        skill: 'React',
        date: '2026-09-15',
        time: '14:00',
        location: 'GLA Library Study Room 3',
        notes: 'Looking forward to learning React hooks!',
      },
      tokenA
    );
    assert(sessReq.status === 201 && sessReq.body.data.session.status === 'pending', 'User A requested session (status: pending)');
    sessionId = sessReq.body.data.session.id || sessReq.body.data.session._id;

    // User B checks session list
    const sessionsB = await req('GET', '/api/sessions', null, tokenB);
    const foundSessB = sessionsB.body.data.sessions.find((s) => (s.id || s._id).toString() === sessionId.toString());
    assert(!!foundSessB && foundSessB.status === 'pending', 'User B sees pending session request');

    // User B accepts session
    const acceptRes = await req('PUT', `/api/sessions/${sessionId}`, { status: 'accepted' }, tokenB);
    assert(acceptRes.status === 200 && acceptRes.body.data.session.status === 'accepted', 'User B accepted session (status: accepted)');

    // User A checks session (simulating refresh)
    const sessionsA = await req('GET', '/api/sessions', null, tokenA);
    const foundSessA = sessionsA.body.data.sessions.find((s) => (s.id || s._id).toString() === sessionId.toString());
    assert(!!foundSessA && foundSessA.status === 'accepted', 'User A sees accepted status persisted');

    // Complete session flow
    const completeRes = await req('PUT', `/api/sessions/${sessionId}`, { status: 'completed' }, tokenA);
    assert(completeRes.status === 200 && completeRes.body.data.session.status === 'completed', 'Session completed (status: completed)');

    // Rejection flow test with a secondary session
    const sessReq2 = await req(
      'POST',
      '/api/sessions',
      {
        providerId: bId,
        skill: 'React',
        date: '2026-09-16',
        time: '15:00',
      },
      tokenA
    );
    rejectSessionId = sessReq2.body.data.session.id || sessReq2.body.data.session._id;
    const rejectRes = await req('PUT', `/api/sessions/${rejectSessionId}`, { status: 'rejected' }, tokenB);
    assert(rejectRes.status === 200 && rejectRes.body.data.session.status === 'rejected', 'Provider rejected session (status: rejected)');

    // Cancellation flow test with a third session
    const sessReq3 = await req(
      'POST',
      '/api/sessions',
      {
        providerId: bId,
        skill: 'React',
        date: '2026-09-17',
        time: '16:00',
      },
      tokenA
    );
    cancelSessionId = sessReq3.body.data.session.id || sessReq3.body.data.session._id;
    const cancelRes = await req('PUT', `/api/sessions/${cancelSessionId}`, { status: 'cancelled' }, tokenA);
    assert(cancelRes.status === 200 && cancelRes.body.data.session.status === 'cancelled', 'Requester cancelled session (status: cancelled)');

    // ==================================================
    // 8. REVIEW TEST (POSITIVE & NEGATIVE)
    // ==================================================
    console.log('\n--- Step 8: Review & Rating Test ---');

    // Negative Test: Review before completion
    const earlyRev = await req('POST', '/api/reviews', { sessionId: rejectSessionId, rating: 5, comment: 'Early' }, tokenA);
    assert(earlyRev.status === 400, 'Negative: Blocked review for non-completed session (HTTP 400)');

    // Negative Test: Invalid rating (>5)
    const invalidRatingRev = await req('POST', '/api/reviews', { sessionId, rating: 6, comment: 'Invalid' }, tokenA);
    assert(invalidRatingRev.status === 400, 'Negative: Blocked invalid rating 6 (HTTP 400)');

    // Negative Test: Non-participant review (User C)
    const nonPartRev = await req('POST', '/api/reviews', { sessionId, rating: 5, comment: 'Intruder' }, tokenC);
    assert(nonPartRev.status === 403, 'Negative: Blocked non-participant User C from reviewing (HTTP 403)');

    // Positive Test: User A reviews User B for completed session
    const validRev = await req(
      'POST',
      '/api/reviews',
      {
        sessionId,
        rating: 5,
        comment: 'Outstanding session on React component architecture!',
      },
      tokenA
    );
    assert(validRev.status === 201 && validRev.body.status === 'success', 'Positive: Review submitted successfully (HTTP 201)');

    // Negative Test: Duplicate review for same session
    const dupRev = await req('POST', '/api/reviews', { sessionId, rating: 4, comment: 'Duplicate' }, tokenA);
    assert(dupRev.status === 400, 'Negative: Blocked duplicate review for same session (HTTP 400)');

    // Verify User B's rating updated in MongoDB
    const updatedDocB = await User.findById(bId);
    assert(updatedDocB.rating === 5.0 && updatedDocB.reviewsCount >= 1, `User B rating updated to ${updatedDocB.rating} (${updatedDocB.reviewsCount} reviews)`);

    // Verify review retrieval
    const reviewsList = await req('GET', `/api/users/${bId}/reviews`);
    assert(reviewsList.status === 200 && reviewsList.body.data.reviews.length > 0, 'GET /api/users/:id/reviews returns user reviews');

    // ==================================================
    // 9. NOTIFICATIONS TEST
    // ==================================================
    console.log('\n--- Step 9: Notifications Event Stream & Read State Test ---');
    const notifsB = await req('GET', '/api/notifications', null, tokenB);
    assert(notifsB.status === 200 && Array.isArray(notifsB.body.data.notifications), 'User B fetched notifications');
    
    // Check if session request and review notifications exist for User B
    const hasReqNotif = notifsB.body.data.notifications.some((n) => n.type === 'session_request');
    const hasRevNotif = notifsB.body.data.notifications.some((n) => n.type === 'review_received');
    assert(hasReqNotif, 'Notification generated for session_request');
    assert(hasRevNotif, 'Notification generated for review_received');

    // Check User A's notifications for session acceptance
    const notifsA = await req('GET', '/api/notifications', null, tokenA);
    const hasAcceptNotif = notifsA.body.data.notifications.some((n) => n.type === 'session_accepted');
    assert(hasAcceptNotif, 'Notification generated for session_accepted');

    // Test mark single notification read
    if (notifsB.body.data.notifications.length > 0) {
      const nId = notifsB.body.data.notifications[0].id || notifsB.body.data.notifications[0]._id;
      const markOne = await req('PUT', `/api/notifications/${nId}/read`, null, tokenB);
      assert(markOne.status === 200 && markOne.body.data.notification.isRead === true, 'Marked single notification as read');
    }

    // Test mark all read
    const markAll = await req('PUT', '/api/notifications/read-all', null, tokenB);
    assert(markAll.status === 200, 'Marked all notifications as read');
    const refreshedNotifsB = await req('GET', '/api/notifications', null, tokenB);
    assert(refreshedNotifsB.body.unreadCount === 0, 'User B unreadCount is 0 after mark-all');

    // ==================================================
    // 10. SETTINGS & PROFILE EDIT PERSISTENCE
    // ==================================================
    console.log('\n--- Step 10: Settings Test (Update & Persistence) ---');
    const newBio = 'Senior CS undergrad passionate about open source and AI';
    const settingsUpdate = await req(
      'PUT',
      '/api/profile',
      {
        name: 'Alice Johnson Updated',
        bio: newBio,
        college: 'GLA University',
        major: 'Artificial Intelligence',
      },
      tokenA
    );
    assert(settingsUpdate.status === 200 && settingsUpdate.body.data.user.bio === newBio, 'Settings updated via PUT /api/profile');

    // Verify persistence via GET /api/auth/me and GET /api/profile
    const verifySettings = await req('GET', '/api/profile', null, tokenA);
    assert(verifySettings.body.data.user.bio === newBio && verifySettings.body.data.user.major === 'Artificial Intelligence', 'Settings persisted on reload');

    // ==================================================
    // 11. AUTHORIZATION TEST (Cross-User Data Isolation)
    // ==================================================
    console.log('\n--- Step 11: Authorization & Security Isolation Test ---');

    // User A cannot accept or reject User B's provider session
    const hackAccept = await req('PUT', `/api/sessions/${rejectSessionId}`, { status: 'accepted' }, tokenA);
    assert(hackAccept.status === 403, 'Security: User A cannot accept session where User B is provider (HTTP 403)');

    // User C cannot access or complete User A & B's session data
    // Session is already completed, so trying to update by non-participant C must fail with 403
    const hackSessionAccess = await req('PUT', `/api/sessions/${sessionId}`, { status: 'cancelled' }, tokenC);
    assert(hackSessionAccess.status === 403, 'Security: User C cannot modify session between A and B (HTTP 403)');

    // User A cannot read User B's notifications
    const bNotifsFromA = await req('GET', `/api/notifications`, null, tokenA);
    const containsBNotification = bNotifsFromA.body.data.notifications.some(
      (n) => (n.recipientId?.toString() || '') === bId
    );
    assert(!containsBNotification, 'Security: User A cannot see User B private notifications');

    // ==================================================
    // 12. LOGOUT & AUTHENTICATION RESTORATION TEST
    // ==================================================
    console.log('\n--- Step 12: Logout & Session Restoration Test ---');

    // Unauthenticated request to protected route
    const unauthProfile = await req('GET', '/api/profile', null, null);
    assert(unauthProfile.status === 401, 'Unauthenticated request correctly blocked (HTTP 401)');

    const invalidTokenProfile = await req('GET', '/api/profile', null, 'invalid_garbage_token');
    assert(invalidTokenProfile.status === 401, 'Malformed token correctly rejected (HTTP 401)');

    // Re-login restores session
    const reLogin = await req('POST', '/api/auth/login', {
      email: emailA,
      password: password,
    });
    assert(reLogin.status === 200 && reLogin.body.data.token, 'Re-login issued fresh JWT token');

    const restoreMe = await req('GET', '/api/auth/me', null, reLogin.body.data.token);
    assert(restoreMe.status === 200 && restoreMe.body.data.user.email === emailA, 'Session restored via /api/auth/me');

  } catch (err) {
    console.error('❌ Exception during Live E2E test:', err);
  } finally {
    // Cleanup test accounts
    console.log('\n🧹 Cleaning up test users and associated documents from MongoDB...');
    const userIds = [userA?.id || userA?._id, userB?.id || userB?._id, userC?.id || userC?._id].filter(Boolean);
    await User.deleteMany({ _id: { $in: userIds } });
    await Session.deleteMany({ _id: { $in: [sessionId, rejectSessionId, cancelSessionId].filter(Boolean) } });
    await Review.deleteMany({ sessionId: { $in: [sessionId, rejectSessionId, cancelSessionId].filter(Boolean) } });
    await Notification.deleteMany({ userId: { $in: userIds } });
    console.log('✨ Cleanup complete.');

    await mongoose.disconnect();

    console.log('\n===============================================================');
    console.log(` 📊 LIVE E2E RESULTS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
    console.log('===============================================================\n');

    process.exit(passedAssertions === totalAssertions ? 0 : 1);
  }
}

runLiveE2ETests();
