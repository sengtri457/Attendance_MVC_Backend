/**
 * Error handling middleware
 * Uses response middleware for consistent error responses
 */
const { handleSequelizeError, sendError, sendNotFound } = require('./response.middleware');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle Sequelize errors using the response middleware
  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError' ||
    err.name === 'SequelizeForeignKeyConstraintError' ||
    err.name === 'SequelizeDatabaseError'
  ) {
    return handleSequelizeError(res, err);
  }

  // Handle HTTP errors with status codes
  if (err.status) {
    return sendError(res, err.message || 'An error occurred', err.status, err);
  }

  // Default error handler
  return sendError(
    res,
    err.message || 'Internal server error',
    500,
    process.env.NODE_ENV === 'development' ? err : null
  );
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  return sendNotFound(res, 'Route');
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
