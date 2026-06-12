async function verifyGoogleIdToken(idToken) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token verification failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const expectedClientId = process.env.GOOGLE_CLIENT_ID;

  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('Google token audience mismatch');
  }

  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw new Error('Google email is not verified');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload.given_name || payload.email,
    picture: payload.picture || null,
    emailVerified: true,
  };
}

module.exports = {
  verifyGoogleIdToken,
};