'use strict';

// Authentication: cookie-session config, credential verification, and the
// gate middleware. Login is a real form (see public/login.html) backed by the
// `users` table; the session lives in a signed, httpOnly cookie.

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const SESSION_MAX_AGE = 12 * 60 * 60 * 1000; // 12 hours

function resolveSecret() {
  if (process.env.COOKIE_SECRET && process.env.COOKIE_SECRET.trim()) {
    return process.env.COOKIE_SECRET.trim();
  }
  console.warn(
    '[auth] WARNING: COOKIE_SECRET is not set. Using a random per-boot secret — ' +
      'all sessions will be invalidated on restart. Set COOKIE_SECRET in production.'
  );
  return crypto.randomBytes(32).toString('hex');
}

/** cookie-session options. `secure` is enabled in production (TLS terminates at the proxy). */
function sessionOptions() {
  return {
    name: 'sess',
    keys: [resolveSecret()],
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

/**
 * Verify a login against the store. Returns a minimal user object to put in the
 * session ({ email }) on success, or null on failure.
 */
function verifyLogin(store, email, password) {
  const user = store.findUserByEmail(email);
  if (!user) return null;
  if (!bcrypt.compareSync(String(password || ''), user.password_hash)) return null;
  return { email: user.email };
}

/** Gate middleware: pass when authenticated, else 401 for /api/* and redirect for pages. */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return res.redirect('/login');
}

module.exports = { sessionOptions, verifyLogin, requireAuth, SESSION_MAX_AGE };
