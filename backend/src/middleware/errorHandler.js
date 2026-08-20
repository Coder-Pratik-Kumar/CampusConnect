/**
 * Middleware to handle 404 Not Found requests.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`,
  });
};

/**
 * Global Error Handling Middleware.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
