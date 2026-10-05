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
import Notification from './models/Notification.js';
import sessionRoutes from './routes/sessionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Setup isolated express test server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', reviewRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const TEST_PORT = 5009;

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

async function runNotificationsApiTests() {
  console.log('==================================================');
  console.log(' 🧪 NOTIFICATIONS API TEST SUITE');
  console.log('==================================================\n');

  await connectDB();

  let server;
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`📡 Test server listening on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  const emailPrefix = `notif_test_${Date.now()}`;
  let passedCount = 0;
  const totalCount = 8;

  let studentA, studentB, studentC;
  let tokenA, tokenB, tokenC;

  try {
    // Cleanup old test data
    await User.deleteMany({ email: new RegExp(emailPrefix) });
    await Session.deleteMany({ skill: 'Notif Test Skill' });
    await Notification.deleteMany({});

    // Create test users
    const password = await bcrypt.hash('Test1234!', 10);

    studentA = await User.create({
      name: 'Notif Student A',
      email: `${emailPrefix}_a@test.com`,
      password,
      college: 'Test University',
      major: 'CS',
      skillsOffered: ['Notif Test Skill'],
      skillsWanted: ['Math'],
    });

    studentB = await User.create({
      name: 'Notif Student B',
      email: `${emailPrefix}_b@test.com`,
      password,
      college: 'Test University',
      major: 'Math',
      skillsOffered: ['Math'],
      skillsWanted: ['Notif Test Skill'],
    });

    studentC = await User.create({
      name: 'Notif Student C',
      email: `${emailPrefix}_c@test.com`,
      password,
      college: 'Other University',
      major: 'Physics',
      skillsOffered: ['Physics'],
      skillsWanted: ['Math'],
    });

    tokenA = jwt.sign({ id: studentA._id }, config.jwtSecret, { expiresIn: '1h' });
    tokenB = jwt.sign({ id: studentB._id }, config.jwtSecret, { expiresIn: '1h' });
    tokenC = jwt.sign({ id: studentC._id }, config.jwtSecret, { expiresIn: '1h' });

    // ── Test 1: Session request creates notification for provider ──
    console.log('Test 1: Session Request Creates Notification for Provider');
    const createRes = await makeRequest(
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
        skill: 'Notif Test Skill',
        date: '2026-12-01',
        time: '3:00 PM',
        duration: '60 min',
        message: 'Test notification trigger',
      }
    );

    const sessionId = createRes.body?.data?.session?._id;

    // Check Student B's notifications
    const notifRes1 = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    if (
      notifRes1.status === 200 &&
      notifRes1.body.data.notifications.length >= 1 &&
      notifRes1.body.data.notifications[0].type === 'session_request'
    ) {
      passedCount++;
      console.log('   ✅ PASSED — Provider received session_request notification.\n');
    } else {
      console.log('   ❌ FAILED — Expected session_request notification for provider.\n');
    }

    // ── Test 2: Unauthenticated request is rejected ──
    console.log('Test 2: Unauthenticated Request Rejected (401)');
    const unauthRes = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
    });

    if (unauthRes.status === 401) {
      passedCount++;
      console.log('   ✅ PASSED — Unauthenticated request blocked (401).\n');
    } else {
      console.log(`   ❌ FAILED — Expected 401, got ${unauthRes.status}.\n`);
    }

    // ── Test 3: User isolation (Student C sees no notifications) ──
    console.log('Test 3: User Isolation (Student C Sees No Notifications)');
    const notifResC = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenC}` },
    });

    if (notifResC.status === 200 && notifResC.body.data.notifications.length === 0) {
      passedCount++;
      console.log('   ✅ PASSED — Student C has 0 notifications (data isolation confirmed).\n');
    } else {
      console.log(`   ❌ FAILED — Expected 0 notifications for Student C, got ${notifResC.body.data?.notifications?.length}.\n`);
    }

    // ── Test 4: Session accepted creates notification for requester ──
    console.log('Test 4: Session Accepted Creates Notification for Requester');
    await makeRequest(
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

    const notifResA1 = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const hasAcceptedNotif = notifResA1.body.data.notifications.some(
      (n) => n.type === 'session_accepted'
    );

    if (notifResA1.status === 200 && hasAcceptedNotif) {
      passedCount++;
      console.log('   ✅ PASSED — Requester received session_accepted notification.\n');
    } else {
      console.log('   ❌ FAILED — Expected session_accepted notification for requester.\n');
    }

    // ── Test 5: Session completed creates notification ──
    console.log('Test 5: Session Completed Creates Notification');
    await makeRequest(
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

    const notifResB2 = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    const hasCompletedNotif = notifResB2.body.data.notifications.some(
      (n) => n.type === 'session_completed'
    );

    if (notifResB2.status === 200 && hasCompletedNotif) {
      passedCount++;
      console.log('   ✅ PASSED — Provider received session_completed notification.\n');
    } else {
      console.log('   ❌ FAILED — Expected session_completed notification for provider.\n');
    }

    // ── Test 6: Review submitted creates notification ──
    console.log('Test 6: Review Submitted Creates Notification for Receiver');
    await makeRequest(
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
        sessionId: sessionId,
        rating: 5,
        comment: 'Great session for notification test!',
      }
    );

    const notifResB3 = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    const hasReviewNotif = notifResB3.body.data.notifications.some(
      (n) => n.type === 'review_received'
    );

    if (notifResB3.status === 200 && hasReviewNotif) {
      passedCount++;
      console.log('   ✅ PASSED — Receiver got review_received notification.\n');
    } else {
      console.log('   ❌ FAILED — Expected review_received notification for receiver.\n');
    }

    // ── Test 7: Mark single notification as read ──
    console.log('Test 7: Mark Single Notification as Read');
    const targetNotif = notifResB3.body.data.notifications.find((n) => !n.isRead);
    const markOneRes = await makeRequest(
      {
        port: TEST_PORT,
        path: `/api/notifications/${targetNotif._id}/read`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
      }
    );

    if (markOneRes.status === 200 && markOneRes.body.data.notification.isRead === true) {
      passedCount++;
      console.log('   ✅ PASSED — Single notification marked as read.\n');
    } else {
      console.log('   ❌ FAILED — Expected notification isRead=true after mark.\n');
    }

    // ── Test 8: Mark all notifications as read ──
    console.log('Test 8: Mark All Notifications as Read');
    const markAllRes = await makeRequest(
      {
        port: TEST_PORT,
        path: '/api/notifications/read-all',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
        },
      }
    );

    const verifyAllRead = await makeRequest({
      port: TEST_PORT,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    if (
      markAllRes.status === 200 &&
      verifyAllRead.body.unreadCount === 0
    ) {
      passedCount++;
      console.log('   ✅ PASSED — All notifications marked as read (unreadCount=0).\n');
    } else {
      console.log(`   ❌ FAILED — Expected unreadCount=0, got ${verifyAllRead.body.unreadCount}.\n`);
    }
  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    // Cleanup test data
    if (studentA) await User.findByIdAndDelete(studentA._id);
    if (studentB) await User.findByIdAndDelete(studentB._id);
    if (studentC) await User.findByIdAndDelete(studentC._id);
    await Session.deleteMany({ skill: 'Notif Test Skill' });
    await Notification.deleteMany({
      recipientId: {
        $in: [studentA?._id, studentB?._id, studentC?._id].filter(Boolean),
      },
    });
    // Also clean up reviews from test
    const { default: Review } = await import('./models/Review.js');
    await Review.deleteMany({ reviewerId: studentA?._id });

    console.log('🧹 Cleaned up temporary test user, session, notification, and review documents from MongoDB.\n');

    console.log('==================================================');
    console.log(` 📊 SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
    console.log('==================================================\n');

    server.close();
    await mongoose.connection.close();
  }
}

runNotificationsApiTests();
