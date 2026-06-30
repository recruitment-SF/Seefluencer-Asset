'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Configure env BEFORE requiring the server (it opens the DB at module load).
const TMP_DB = path.join(os.tmpdir(), `assetserver-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = TMP_DB;
process.env.AUTH_SEED_EMAIL = 'admin@test.com';
process.env.AUTH_SEED_PASSWORD = 'pw123';
process.env.COOKIE_SECRET = 'test-secret-value';
process.env.NODE_ENV = 'test';

const app = require('./server');

let server;
let base;

function cookiesFrom(res) {
  const arr = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  return arr.map((c) => c.split(';')[0]).join('; ');
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(() => {
  server.close();
  app.locals.store.close();
  for (const s of ['', '-wal', '-shm']) {
    try {
      fs.unlinkSync(TMP_DB + s);
    } catch (_) {
      /* ignore */
    }
  }
});

test('unauthenticated page request redirects to /login', async () => {
  const r = await fetch(base + '/', { redirect: 'manual' });
  assert.equal(r.status, 302);
  assert.match(r.headers.get('location'), /\/login/);
});

test('unauthenticated API request returns 401', async () => {
  const r = await fetch(base + '/api/all');
  assert.equal(r.status, 401);
});

test('bad credentials are rejected; good credentials set a session', async () => {
  let r = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'wrong' }),
  });
  assert.equal(r.status, 401);

  r = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'pw123' }),
  });
  assert.equal(r.status, 200);
  assert.ok(cookiesFrom(r).includes('sess'), 'session cookie set');
});

test('authenticated CRUD flow against the seeded data', async () => {
  const login = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'pw123' }),
  });
  const cookie = cookiesFrom(login);

  // GET /api/all -> 142 seeded umum
  let r = await fetch(base + '/api/all', { headers: { cookie } });
  assert.equal(r.status, 200);
  const all = await r.json();
  assert.equal(all.umum.length, 142);

  // create
  r = await fetch(base + '/api/umum', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ nama: 'Laptop QA', kode: 'T-1', emoji: '\u{1F4BB}' }),
  });
  assert.equal(r.status, 201);
  const created = await r.json();
  assert.ok(created.id, 'server assigned an id');

  // update
  r = await fetch(`${base}/api/umum/${created.id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ nama: 'Laptop QA v2', kode: 'T-1', emoji: '\u{1F4BB}' }),
  });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).nama, 'Laptop QA v2');

  // delete
  r = await fetch(`${base}/api/umum/${created.id}`, { method: 'DELETE', headers: { cookie } });
  assert.equal(r.status, 200);

  // unknown collection -> 404
  r = await fetch(base + '/api/bogus', { headers: { cookie } });
  assert.equal(r.status, 404);
});

test('logout clears the session', async () => {
  const login = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'pw123' }),
  });
  const cookie = cookiesFrom(login);

  const out = await fetch(base + '/api/logout', { method: 'POST', headers: { cookie } });
  assert.equal(out.status, 200);

  // Carrying the post-logout (cleared) cookie no longer authenticates.
  const cleared = cookiesFrom(out);
  const r = await fetch(base + '/api/all', { headers: { cookie: cleared } });
  assert.equal(r.status, 401);
});
