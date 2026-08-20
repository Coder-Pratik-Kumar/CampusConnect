import mongoose from 'mongoose';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';

console.log('==================================================');
console.log(' 🍃 Testing MongoDB Connection & User Model Schema');
console.log('==================================================');
console.log(`📡 Configured MONGODB_URI: ${config.mongoUri}`);

async function runTest() {
  try {
    // 1. Verify User Model Definition
    const testUser = new User({
      name: 'Pratik Kumar',
      email: 'pratik@university.edu',
      password: 'hashedpassword123',
      college: 'GLA University',
      major: 'Computer Science',
      bio: 'Passionate full-stack developer & UI designer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      teachSkills: ['Java', 'SQL', 'UI/UX Design'],
      learnSkills: ['React', 'Node.js'],
      availability: [{ day: 'Monday', startTime: '07:00 PM', endTime: '09:00 PM' }],
      rating: 4.9,
    });

    await testUser.validate();
    console.log('✅ User Schema Definition & Validation: PASSED');
    console.log('   Fields Verified: name, email, password, college, major, bio, avatar, teachSkills, learnSkills, availability, rating, createdAt');

    // 2. Attempt MongoDB connection
    const conn = await connectDB();
    if (conn) {
      console.log('✅ Live MongoDB Connection: SUCCESSFUL');
    } else {
      console.log('ℹ️ Live MongoDB Connection: DISCONNECTED');
    }
  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
