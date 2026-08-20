import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_not_for_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
