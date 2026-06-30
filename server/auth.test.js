'use strict';

const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const { verifyLogin, requireAuth } = require('./auth');

const fakeStore = {
  findUserByEmail(email) {
    if (String(email).trim().toLowerCase() === 'admin@x.com') {
      return { email: 'admin@x.com', password_hash: bcrypt.hashSync('secret', 10) };
    }
    return undefined;
  },
};

function mockRes() {
  return {
    statusCode: 200,
    redirectedTo: null,
    jsonBody: null,
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(b) {
      this.jsonBody = b;
      return this;
    },
    redirect(u) {
      this.redirectedTo = u;
      return this;
    },
  };
}

test('verifyLogin accepts correct credentials', () => {
  const u = verifyLogin(fakeStore, 'admin@x.com', 'secret');
  assert.ok(u);
  assert.equal(u.email, 'admin@x.com');
});

test('verifyLogin rejects a wrong password or unknown email', () => {
  assert.equal(verifyLogin(fakeStore, 'admin@x.com', 'wrong'), null);
  assert.equal(verifyLogin(fakeStore, 'ghost@x.com', 'secret'), null);
});

test('requireAuth calls next() when the session has a user', () => {
  let called = false;
  requireAuth({ session: { user: { email: 'a' } }, path: '/api/all' }, mockRes(), () => {
    called = true;
  });
  assert.equal(called, true);
});

test('requireAuth returns 401 for an unauthenticated API request', () => {
  const res = mockRes();
  let called = false;
  requireAuth({ session: {}, path: '/api/all' }, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
});

test('requireAuth redirects an unauthenticated page request to /login', () => {
  const res = mockRes();
  let called = false;
  requireAuth({ session: {}, path: '/' }, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.redirectedTo, '/login');
});
