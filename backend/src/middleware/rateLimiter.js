const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login attempts.
 * Max 10 attempts per IP per 15 minutes.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this device. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true, // only count failed attempts
});

/**
 * Rate limiter for OTP send requests (signup start + forgot password start).
 * Max 5 OTP sends per IP per hour — protects Brevo email quota.
 */
const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many verification codes requested from this device. Please try again in 1 hour.',
  },
});

/**
 * Rate limiter for OTP verify attempts.
 * Max 10 attempts per IP per 15 minutes.
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many verification attempts from this device. Please try again in 15 minutes.',
  },
});

/**
 * Rate limiter for general auth endpoints (register, google sign-in).
 * Max 20 requests per IP per 15 minutes.
 */
const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this device. Please try again in 15 minutes.',
  },
});

module.exports = {
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  generalAuthLimiter,
};
