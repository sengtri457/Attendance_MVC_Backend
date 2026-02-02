/**
 * Response Middleware
 * Provides standardized success and error response handlers
 * Makes code more reusable and consistent across all controllers
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Error details (validation errors, etc.)
 * @param {string} errorCode - Custom error code
 */
const sendError = (res, message = 'Internal server error', statusCode = 500, errors = null, errorCode = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (errorCode) {
    response.errorCode = errorCode;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development' && errors && errors.stack) {
    response.debug = {
      stack: errors.stack,
    };
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} validationErrors - Array of validation errors from express-validator
 */
const sendValidationError = (res, validationErrors) => {
  return sendError(
    res,
    'Validation failed',
    400,
    validationErrors.map((err) => ({
      field: err.param || err.path,
      message: err.msg || err.message,
      value: err.value,
    })),
    'VALIDATION_ERROR'
  );
};

/**
 * Send not found error response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'Student', 'Class')
 */
const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404, null, 'NOT_FOUND');
};

/**
 * Send unauthorized error response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, message, 401, null, 'UNAUTHORIZED');
};

/**
 * Send forbidden error response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, message, 403, null, 'FORBIDDEN');
};

/**
 * Send conflict error response (e.g., duplicate entry)
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 * @param {*} errors - Additional error details
 */
const sendConflict = (res, message = 'Conflict', errors = null) => {
  return sendError(res, message, 409, errors, 'CONFLICT');
};

/**
 * Handle Sequelize errors and convert to appropriate HTTP responses
 * @param {Object} res - Express response object
 * @param {Error} error - Sequelize error object
 */
const handleSequelizeError = (res, error) => {
  // Sequelize validation error
  if (error.name === 'SequelizeValidationError') {
    return sendError(
      res,
      'Validation error',
      400,
      error.errors.map((e) => ({
        field: e.path,
        message: e.message,
        value: e.value,
        type: e.type,
      })),
      'VALIDATION_ERROR'
    );
  }

  // Sequelize unique constraint error
  if (error.name === 'SequelizeUniqueConstraintError') {
    return sendConflict(
      res,
      'Duplicate entry',
      error.errors.map((e) => ({
        field: e.path,
        message: e.message,
        value: e.value,
      }))
    );
  }

  // Sequelize foreign key constraint error
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(
      res,
      'Foreign key constraint error - Referenced record does not exist',
      400,
      {
        field: error.fields,
        table: error.table,
      },
      'FOREIGN_KEY_ERROR'
    );
  }

  // Sequelize database error
  if (error.name === 'SequelizeDatabaseError') {
    return sendError(
      res,
      'Database error',
      500,
      {
        message: error.message,
        sql: process.env.NODE_ENV === 'development' ? error.sql : undefined,
      },
      'DATABASE_ERROR'
    );
  }

  // Default Sequelize error
  return sendError(
    res,
    error.message || 'Database operation failed',
    500,
    process.env.NODE_ENV === 'development' ? { name: error.name, stack: error.stack } : null,
    'DATABASE_ERROR'
  );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Async handler error:', error);
      next(error);
    });
  };
};

/**
 * Check validation results from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - True if validation passed, false otherwise
 */
const checkValidation = (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    sendValidationError(res, errors.array());
    return false;
  }
  return true;
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  handleSequelizeError,
  asyncHandler,
  checkValidation,
};
