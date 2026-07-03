const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { User, SignupChallenge, PasswordResetChallenge } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendBrevoOtpEmail, sendBrevoResetOtpEmail } = require('../services/email');
const { verifyGoogleIdToken } = require('../services/googleAuth');
const { isDisposableEmail } = require('../services/disposableEmail');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
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

async function upsertSignupChallenge({ email, name, otpHash, otpExpiresAt }) {
  const existing = await SignupChallenge.findOne({ where: { email } });
  if (existing) {
    existing.name = name;
    existing.otpHash = otpHash;
    existing.otpExpiresAt = otpExpiresAt;
    existing.verifiedAt = null;
    await existing.save();
    return existing;
  }

  return SignupChallenge.create({
    email,
    name,
    otpHash,
    otpExpiresAt,
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);

    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a real email address. Disposable or temporary email addresses are not allowed.' });
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

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/signup/start', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const normalizedEmail = normalizeEmail(email);

    if (isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a real email address. Disposable or temporary email addresses are not allowed.' });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otp = createOtp();
    console.log('--- SIGNUP OTP GENERATED:', otp, 'FOR', normalizedEmail, '---');
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

router.post('/signup/verify', async (req, res) => {
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

    if (new Date(challenge.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), challenge.otpHash);
    if (!isOtpValid) {
      return res.status(401).json({ message: 'Invalid OTP' });
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

router.post('/signup/complete', async (req, res) => {
  try {
    const { signupToken, password } = req.body;

    if (!signupToken || !password) {
      return res.status(400).json({ message: 'signupToken and password are required' });
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

    return res.status(201).json({
      message: 'Account created successfully',
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account' });
  }
});

router.post('/google', async (req, res) => {
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

    return res.json({
      message: 'Google sign-in successful',
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Google sign-in failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

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

    return res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/forgot-password/start', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ message: 'Account with this email does not exist' });
    }

    if (user.authProvider === 'GOOGLE') {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }

    const otp = createOtp();
    console.log('--- PASSWORD RESET OTP GENERATED:', otp, 'FOR', normalizedEmail, '---');
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existing = await PasswordResetChallenge.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      existing.otpHash = otpHash;
      existing.otpExpiresAt = otpExpiresAt;
      existing.verifiedAt = null;
      await existing.save();
    } else {
      await PasswordResetChallenge.create({
        email: normalizedEmail,
        otpHash,
        otpExpiresAt,
      });
    }

    await sendBrevoResetOtpEmail({
      email: normalizedEmail,
      name: user.name,
      otp,
    });

    return res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot password start failed:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
});

router.post('/forgot-password/verify', async (req, res) => {
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

    if (new Date(challenge.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), challenge.otpHash);
    if (!isOtpValid) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    challenge.verifiedAt = new Date();
    await challenge.save();

    return res.json({
      message: 'OTP verified successfully',
      resetToken: createResetToken(challenge),
    });
  } catch (error) {
    console.error('Forgot password verify failed:', error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

router.post('/forgot-password/complete', async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Reset token and password are required' });
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
    console.error('Forgot password complete failed:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

router.get('/admin-check', authenticate, requireRole('ADMIN'), (req, res) => {
  return res.json({ message: 'Admin access granted' });
});

module.exports = router;