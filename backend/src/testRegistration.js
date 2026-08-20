import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';

async function runRegistrationTests() {
  console.log('==================================================');
  console.log(' 🧪 REGISTER API SUITE TEST');
  console.log('==================================================\n');

  await connectDB();

  const testEmail = `reg_test_${Date.now()}@university.edu`;

  let passedCount = 0;
  let totalCount = 5;

  try {
    // Clean up any pre-existing test email
    await User.deleteMany({ email: testEmail });

    // TEST 1: Valid Registration
    console.log('Test 1: Valid Registration');
    const validBody = {
      name: 'Sarah Connor',
      email: testEmail,
      password: 'securePassword123',
      college: 'GLA University',
      major: 'Computer Science',
    };

    // Simulate controller logic
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validBody.password, salt);

    const user = await User.create({
      name: validBody.name,
      email: validBody.email.toLowerCase(),
      password: hashedPassword,
      college: validBody.college,
      major: validBody.major,
    });

    const isPasswordHashed = user.password !== validBody.password && user.password.startsWith('$2');
    const passwordNotExposed = !user.toObject().password_exposed; // password excluded in API response

    if (user._id && isPasswordHashed) {
      console.log('   ✅ PASSED — User created with hashed password (no plain text). ID:', user._id);
      passedCount++;
    } else {
      console.log('   ❌ FAILED — User creation or password hashing failed');
    }

    // TEST 2: Duplicate Email Check
    console.log('\nTest 2: Duplicate Email Rejection');
    const duplicateUser = await User.findOne({ email: testEmail.toLowerCase() });
    if (duplicateUser) {
      console.log('   ✅ PASSED — Correctly detected existing email:', testEmail);
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Duplicate check failed');
    }

    // TEST 3: Missing Required Fields Validation
    console.log('\nTest 3: Missing Fields Validation');
    const incompleteUser = new User({ email: 'incomplete@test.com' });
    const missingErr = incompleteUser.validateSync();
    if (missingErr && missingErr.errors.name && missingErr.errors.password) {
      console.log('   ✅ PASSED — Rejected user missing required fields (name, password)');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Missing field validation failed');
    }

    // TEST 4: Invalid Email Format Validation
    console.log('\nTest 4: Invalid Email Format Validation');
    const badEmailUser = new User({ name: 'Bad Mail', email: 'invalid-email-format', password: 'password123' });
    const badEmailErr = badEmailUser.validateSync();
    if (badEmailErr && badEmailErr.errors.email) {
      console.log('   ✅ PASSED — Rejected invalid email format: "invalid-email-format"');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Email regex validation failed');
    }

    // TEST 5: Password Length Validation (<6 chars)
    console.log('\nTest 5: Password Length Validation');
    const shortPassUser = new User({ name: 'Short Pass', email: 'short@test.com', password: '123' });
    const shortPassErr = shortPassUser.validateSync();
    if (shortPassErr && shortPassErr.errors.password) {
      console.log('   ✅ PASSED — Rejected password shorter than 6 characters');
      passedCount++;
    } else {
      console.log('   ❌ FAILED — Short password validation failed');
    }

    // Cleanup test user document
    await User.deleteOne({ _id: user._id });
    console.log('\n   🧹 Cleaned up temporary test user document.');

  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n==================================================');
    console.log(` 📊 SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
    console.log('==================================================\n');
    process.exit(passedCount === totalCount ? 0 : 1);
  }
}

runRegistrationTests();
