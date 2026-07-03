const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'ethnivaa_session';

const COOKIE_OPTIONS = {
  httpOnly: true,           // JavaScript cannot read this cookie — XSS-safe
  secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
  sameSite: 'strict',       // No cross-site requests can carry this cookie
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

function getTokenFromRequest(req) {
  // Priority 1: httpOnly cookie (secure — JS can't steal it)
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }

  // Priority 2: Authorization header (legacy fallback for API clients / mobile)
  const header = req.headers.authorization;
  if (header) {
    const [scheme, token] = header.split(' ');
    if (scheme === 'Bearer' && token) {
      return token;
    }
  }

  return null;
}

function authenticate(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = {
      id: payload.userId,
      email: payload.email || null,
      name: payload.name || null,
      role: payload.role || 'CUSTOMER',
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  COOKIE_NAME,
  COOKIE_OPTIONS,
};