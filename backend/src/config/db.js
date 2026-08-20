import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Establish connection to MongoDB using Mongoose.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` 🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(` ⚠️ MongoDB Connection Warning: ${error.message}`);
    console.error(`    (Make sure MongoDB service is running locally or MONGODB_URI in .env is valid)`);
    return null;
  }
};
