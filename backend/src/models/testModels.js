import mongoose from 'mongoose';
import { User, Skill, Session, Review } from './index.js';

console.log('--- Testing Mongoose Models Initialization ---');

// 1. Test User Model Schema Validation
const testUser = new User({
  name: 'Test Student',
  email: 'test@student.edu',
  password: 'secretpassword123',
  college: 'State University',
  major: 'Computer Science',
  teachSkills: ['React', 'Node.js'],
  learnSkills: ['Python'],
});
const userValidationError = testUser.validateSync();
console.log('✅ User Model Compilation & Validation:', userValidationError ? userValidationError.message : 'PASSED');

// 2. Test Skill Model Schema Validation
const testSkill = new Skill({
  name: 'JavaScript',
  category: 'Programming',
  description: 'Core web programming language',
});
const skillValidationError = testSkill.validateSync();
console.log('✅ Skill Model Compilation & Validation:', skillValidationError ? skillValidationError.message : 'PASSED');

// 3. Test Session Model Schema Validation
const testSession = new Session({
  requesterId: new mongoose.Types.ObjectId(),
  providerId: new mongoose.Types.ObjectId(),
  teachSkill: 'React',
  learnSkill: 'Python',
  date: '2026-10-15',
  time: '4:00 PM',
  duration: '60 Min',
  status: 'pending',
});
const sessionValidationError = testSession.validateSync();
console.log('✅ Session Model Compilation & Validation:', sessionValidationError ? sessionValidationError.message : 'PASSED');

// 4. Test Review Model Schema Validation
const testReview = new Review({
  sessionId: new mongoose.Types.ObjectId(),
  authorId: new mongoose.Types.ObjectId(),
  recipientId: new mongoose.Types.ObjectId(),
  rating: 5,
  reviewText: 'Awesome peer session! Learned a lot about React hooks.',
});
const reviewValidationError = testReview.validateSync();
console.log('✅ Review Model Compilation & Validation:', reviewValidationError ? reviewValidationError.message : 'PASSED');

console.log('---------------------------------------------');
process.exit(0);
