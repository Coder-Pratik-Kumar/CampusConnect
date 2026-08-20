import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import './models/index.js'; // Registers all Mongoose models (User, Skill, Session, Review)

const app = express();

// ── Global Middleware ──
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api', reviewRoutes);

// ── Fallback & Error Handling Middleware ──
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start HTTP Server & Connect Database ──
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(` 🚀 CampusConnect API Server`);
  console.log(` 📡 Running on port: ${PORT}`);
  console.log(` 🌍 Environment: ${config.nodeEnv}`);
  console.log(` 🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(` 🔗 Auth register: http://localhost:${PORT}/api/auth/register`);
  console.log(`=================================`);

  // Establish MongoDB connection
  connectDB();
});

export default app;
