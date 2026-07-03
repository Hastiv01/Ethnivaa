const isProduction = process.env.NODE_ENV === 'production';

function notFound(req, res) {
  return res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  // In production, never leak internal error details (stack traces, DB errors,
  // file paths, library names) to the client. Log them server-side instead.
  let message;
  if (statusCode >= 500) {
    if (isProduction) {
      console.error('[ERROR]', err);
      message = 'Something went wrong. Please try again later.';
    } else {
      message = err.message || 'Internal server error';
    }
  } else {
    // 4xx errors are safe to surface — they are validation/auth messages we wrote
    message = err.message || 'Request error';
  }

  return res.status(statusCode).json({ message });
}

module.exports = {
  notFound,
  errorHandler,
};