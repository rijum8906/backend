class ApiError extends Error {
  constructor(message, statusCode, description) {
    super(message);
    this.statusCode = statusCode || 500;
    this.description = description || message;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
