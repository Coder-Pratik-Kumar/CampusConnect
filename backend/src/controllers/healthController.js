import mongoose from 'mongoose';

/**
 * Controller for health check endpoints.
 */
export const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'success',
    message: 'CampusConnect API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    database: dbStatusMap[dbState] || 'unknown',
  });
};
