const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Handle specific Mongoose/MongoDB errors if needed
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found';
    errorCode = 'INVALID_OBJECT_ID';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    errorCode = 'VALIDATION_ERROR';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
    errorCode = 'DUPLICATE_RESOURCE';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    // Do not include stack trace in production-style response per spec
  });
};

module.exports = { errorHandler };
