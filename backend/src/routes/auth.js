const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { User, SignupChallenge, PasswordResetChallenge } = require('../models');
const { authenticate, requireRole, COOKIE_NAME, COOKIE_OPTIONS } = require('../middleware/auth');
const { sendBrevoOtpEmail, sendBrevoResetOtpEmail } = require('../services/email');
const { verifyGoogleIdToken } = require('../services/googleAuth');
const { isDisposableEmail } = require('../services/disposableEmail');
const {
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  generalAuthLimiter,
} = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Constants ───────────────────────────────────────────────────────────────
const OTP_MAX_ATTEMPTS = 5; // lock after this many wrong guesses

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Input length guard — prevents bcrypt DoS (hashing huge strings is expensive)
 * and DB column overflow errors.
 * Returns an error message string if invalid, null if all good.
 */
function validateInputLengths({ name, email, password } = {}) {
  if (name !== undefined && String(name).trim().length > 100) {
    return 'Name must be 100 characters or fewer.';
  }
  if (email !== undefined && String(email).trim().length > 254) {
    return 'Email address is too long.';
  }
  if (password !== undefined && String(password).length > 128) {
    return 'Password must be 128 characters or fewer.';
  }
  return null;
}

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Sets the JWT as a secure httpOnly cookie AND returns the token string
 * so existing frontend Authorization-header code keeps working during migration.
 */
function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function createSignupToken(challenge) {
  return jwt.sign(
    {
      signupChallengeId: challenge.id,
      email: challenge.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function createResetToken(challenge) {
  return jwt.sign(
    {
      resetChallengeId: challenge.id,
      email: challenge.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}

/**
 * Password strength validation.
 * Requires: min 8 chars, 1 uppercase, 1 digit, 1 special character.
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character (e.g. @, #, !, $).';
  }
  return null; // null = valid
}

async function upsertSignupChallenge({ email, name, otpHash, otpExpiresAt }) {
  const existing = await SignupChallenge.findOne({ where: { email } });
  if (existing) {
    existing.name = name;
    existing.otpHash = otpHash;
    existing.otpExpiresAt = otpExpiresAt;
    existing.verifiedAt = null;
    existing.otpAttempts = 0; // reset attempts on resend
    await existing.save();
    return existing;
  }

  return SignupChallenge.create({
    email,
    name,
    otpHash,
    otpExpiresAt,
    otpAttempts: 0,
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Legacy direct-register (no OTP) — apply rate limiter + disposable + password strength
router.post('/register', generalAuthLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const lengthError = validateInputLengths({ name, email, password });
    if (lengthError) return res.status(400).json({ message: lengthError });

    const normalizedEmail = normalizeEmail(email);

    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a real email address. Disposable or temporary email addresses are not allowed.' });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'CUSTOMER',
      authProvider: 'EMAIL',
      emailVerifiedAt: new Date(),
    });

    const token = createToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

// Step 1: Start signup — send OTP
router.post('/signup/start', otpSendLimiter, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lengthError = validateInputLengths({ name, email });
    if (lengthError) return res.status(400).json({ message: lengthError });

    const normalizedEmail = normalizeEmail(email);

    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a real email address. Disposable or temporary email addresses are not allowed.' });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otp = createOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const challenge = await upsertSignupChallenge({
      email: normalizedEmail,
      name: String(name).trim(),
      otpHash,
      otpExpiresAt,
    });

    await sendBrevoOtpEmail({
      email: normalizedEmail,
      name: String(name).trim(),
      otp,
    });

    return res.status(200).json({
      message: 'OTP sent to email',
      expiresAt: challenge.otpExpiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Step 2: Verify OTP — with attempt lockout
router.post('/signup/verify', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const challenge = await SignupChallenge.findOne({ where: { email: normalizedEmail } });

    if (!challenge) {
      return res.status(404).json({ message: 'Signup challenge not found' });
    }

    if (challenge.verifiedAt) {
      return res.status(400).json({ message: 'OTP already verified' });
    }

    // Lockout after too many wrong attempts
    if (challenge.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: `Too many incorrect attempts. Please request a new verification code.`,
      });
    }

    if (new Date(challenge.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), challenge.otpHash);
    if (!isOtpValid) {
      challenge.otpAttempts += 1;
      await challenge.save();
      const remaining = OTP_MAX_ATTEMPTS - challenge.otpAttempts;
      return res.status(401).json({
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    challenge.verifiedAt = new Date();
    await challenge.save();

    return res.json({
      message: 'OTP verified successfully',
      signupToken: createSignupToken(challenge),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Step 3: Complete signup — set password with strength check
router.post('/signup/complete', generalAuthLimiter, async (req, res) => {
  try {
    const { signupToken, password } = req.body;

    if (!signupToken || !password) {
      return res.status(400).json({ message: 'signupToken and password are required' });
    }

    const lengthError = validateInputLengths({ password });
    if (lengthError) return res.status(400).json({ message: lengthError });

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    let payload;
    try {
      payload = jwt.verify(signupToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired signup token' });
    }

    const challenge = await SignupChallenge.findByPk(payload.signupChallengeId);
    if (!challenge || challenge.email !== payload.email) {
      return res.status(404).json({ message: 'Signup challenge not found' });
    }

    if (!challenge.verifiedAt) {
      return res.status(400).json({ message: 'OTP must be verified before creating the account' });
    }

    const existingUser = await User.findOne({ where: { email: challenge.email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: challenge.name,
      email: challenge.email,
      passwordHash,
      role: 'CUSTOMER',
      authProvider: 'EMAIL',
      emailVerifiedAt: new Date(),
    });

    await challenge.destroy();
    const token = createToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account' });
  }
});

// Google Sign-In
router.post('/google', generalAuthLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    const googleUser = await verifyGoogleIdToken(idToken);
    const normalizedEmail = normalizeEmail(googleUser.email);
    const [user] = await User.findOrCreate({
      where: { email: normalizedEmail },
      defaults: {
        name: googleUser.name,
        email: normalizedEmail,
        passwordHash: null,
        role: 'CUSTOMER',
        authProvider: 'GOOGLE',
        googleSub: googleUser.sub,
        emailVerifiedAt: new Date(),
      },
    });

    const updates = {};
    if (!user.googleSub) {
      updates.googleSub = googleUser.sub;
    }
    if (!user.emailVerifiedAt) {
      updates.emailVerifiedAt = new Date();
    }
    if (user.authProvider !== 'GOOGLE' && !user.passwordHash) {
      updates.authProvider = 'GOOGLE';
    }
    if (!user.name) {
      updates.name = googleUser.name;
    }

    if (Object.keys(updates).length > 0) {
      await user.update(updates);
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    return res.json({
      message: 'Google sign-in successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Google sign-in failed' });
  }
});

// Login — with rate limiter
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const lengthError = validateInputLengths({ email, password });
    if (lengthError) return res.status(400).json({ message: lengthError });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    return res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

// Forgot Password Step 1: Send OTP
// Anti-enumeration: always respond with same message whether email exists or not
router.post('/forgot-password/start', otpSendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const lengthError = validateInputLengths({ email });
    if (lengthError) return res.status(400).json({ message: lengthError });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Anti-enumeration: if no user or Google-only account, respond with same
    // success message so attackers cannot discover which emails are registered.
    if (!user || user.authProvider === 'GOOGLE') {
      return res.status(200).json({ message: 'If an account with this email exists, an OTP has been sent.' });
    }

    const otp = createOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existing = await PasswordResetChallenge.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      existing.otpHash = otpHash;
      existing.otpExpiresAt = otpExpiresAt;
      existing.verifiedAt = null;
      existing.otpAttempts = 0; // reset attempts on resend
      await existing.save();
    } else {
      await PasswordResetChallenge.create({
        email: normalizedEmail,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
      });
    }

    await sendBrevoResetOtpEmail({
      email: normalizedEmail,
      name: user.name,
      otp,
    });

    return res.status(200).json({ message: 'If an account with this email exists, an OTP has been sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Forgot Password Step 2: Verify OTP — with attempt lockout
router.post('/forgot-password/verify', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const challenge = await PasswordResetChallenge.findOne({ where: { email: normalizedEmail } });
    if (!challenge) {
      return res.status(404).json({ message: 'Password reset session not found' });
    }

    if (challenge.verifiedAt) {
      return res.status(400).json({ message: 'OTP already verified' });
    }

    // Lockout after too many wrong attempts
    if (challenge.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    if (new Date(challenge.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), challenge.otpHash);
    if (!isOtpValid) {
      challenge.otpAttempts += 1;
      await challenge.save();
      const remaining = OTP_MAX_ATTEMPTS - challenge.otpAttempts;
      return res.status(401).json({
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    challenge.verifiedAt = new Date();
    await challenge.save();

    return res.json({
      message: 'OTP verified successfully',
      resetToken: createResetToken(challenge),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Forgot Password Step 3: Set new password with strength check
router.post('/forgot-password/complete', generalAuthLimiter, async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Reset token and password are required' });
    }

    const lengthError = validateInputLengths({ password });
    if (lengthError) return res.status(400).json({ message: lengthError });

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    const challenge = await PasswordResetChallenge.findByPk(payload.resetChallengeId);
    if (!challenge || challenge.email !== payload.email) {
      return res.status(404).json({ message: 'Password reset session not found' });
    }

    if (!challenge.verifiedAt) {
      return res.status(400).json({ message: 'OTP must be verified before setting a new password' });
    }

    const user = await User.findOne({ where: { email: challenge.email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await user.update({ passwordHash });
    await challenge.destroy();

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

// Logout — clears the httpOnly session cookie
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out successfully' });
});

router.get('/admin-check', authenticate, requireRole('ADMIN'), (req, res) => {
  return res.json({ message: 'Admin access granted' });
});

module.exports = router;