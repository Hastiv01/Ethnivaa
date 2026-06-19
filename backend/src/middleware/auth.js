const jwt = require('jsonwebtoken');

function getTokenFromHeader(header) {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function authenticate(req, res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Build req.user from JWT payload — no DB round-trip needed per request.
    // Token expiry is the security boundary (typically 7d).
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
};