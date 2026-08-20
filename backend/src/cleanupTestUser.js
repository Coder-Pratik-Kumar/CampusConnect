import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';

await connectDB();
const result = await User.deleteOne({ email: 'logintest@university.edu' });
console.log('Cleaned up login test user:', result.deletedCount, 'document(s) removed');
await mongoose.disconnect();
