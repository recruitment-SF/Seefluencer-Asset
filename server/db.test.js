'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createDb } = require('./db');

let counter = 0;
function tmpDbPath() {
  return path.join(os.tmpdir(), `assettest-${process.pid}-${Date.now()}-${counter++}.db`);
}
function cleanup(p) {
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      fs.unlinkSync(p + suffix);
    } catch (_) {
      /* ignore */
    }
  }
}

test('creates tables and seeds collections + user on first open', () => {
  const p = tmpDbPath();
  const api = createDb(p, { seedEmail: 'Admin@Example.com', seedPassword: 'pw123' });
  api.seedIfEmpty();
  api.ensureAdminAccount();

  assert.equal(api.listAll('umum').length, 142);
  assert.equal(api.listAll('tb').length, 2);
  assert.equal(api.listAll('hp').length, 1);
  assert.equal(api.listAll('habis').length, 2);

  const u = api.findUserByEmail('admin@example.com'); // case-insensitive
  assert.ok(u, 'seeded user found');
  assert.ok(bcrypt.compareSync('pw123', u.password_hash), 'password verifies');

  api.close();
  cleanup(p);
});

test('does not re-seed when data already present', () => {
  const p = tmpDbPath();
  let api = createDb(p, { seedPassword: 'pw' });
  api.seedIfEmpty();
  api.ensureAdminAccount();
  api.close();

  api = createDb(p, { seedPassword: 'pw' });
  api.seedIfEmpty();
  api.ensureAdminAccount();
  assert.equal(api.listAll('umum').length, 142, 'umum not duplicated');
  assert.equal(api.db.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1, 'user not duplicated');
  api.close();
  cleanup(p);
});

test('ensureAdminAccount updates the password when AUTH_SEED_PASSWORD changes', () => {
  const p = tmpDbPath();
  let api = createDb(p, { seedEmail: 'a@x.com', seedPassword: 'old-pass' });
  api.seedIfEmpty();
  api.ensureAdminAccount();
  api.close();

  // Reopen the same DB with a new password (simulates editing .env + redeploy).
  api = createDb(p, { seedEmail: 'a@x.com', seedPassword: 'new-pass' });
  api.ensureAdminAccount();
  const u = api.findUserByEmail('a@x.com');
  assert.equal(bcrypt.compareSync('new-pass', u.password_hash), true, 'new password works');
  assert.equal(bcrypt.compareSync('old-pass', u.password_hash), false, 'old password rejected');
  assert.equal(api.db.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1, 'still a single admin');
  api.close();
  cleanup(p);
});

test('ensureAdminAccount is a no-op when the password is unchanged', () => {
  const p = tmpDbPath();
  let api = createDb(p, { seedEmail: 'a@x.com', seedPassword: 'same-pass' });
  api.ensureAdminAccount();
  const hashBefore = api.findUserByEmail('a@x.com').password_hash;
  api.close();

  api = createDb(p, { seedEmail: 'a@x.com', seedPassword: 'same-pass' });
  api.ensureAdminAccount();
  assert.equal(api.findUserByEmail('a@x.com').password_hash, hashBefore, 'hash not rewritten');
  api.close();
  cleanup(p);
});

test('create/update/remove round-trip with server-assigned id', () => {
  const p = tmpDbPath();
  const api = createDb(p, { seedPassword: 'pw' });
  api.seedIfEmpty();

  const created = api.create('umum', { nama: 'Test', kode: 'X-1', emoji: '\u{1F527}' });
  assert.equal(typeof created.id, 'number');
  const id = created.id;

  const updated = api.update('umum', id, { nama: 'Test2', kode: 'X-1', emoji: '\u{1F527}' });
  assert.equal(updated.nama, 'Test2');
  assert.equal(updated.id, id);

  const fetched = api.listAll('umum').find((x) => x.id === id);
  assert.equal(fetched.nama, 'Test2', 'update persisted');

  assert.equal(api.remove('umum', id), true);
  assert.equal(api.listAll('umum').find((x) => x.id === id), undefined, 'row removed');

  api.close();
  cleanup(p);
});

test('update returns null for a missing id; remove returns false', () => {
  const p = tmpDbPath();
  const api = createDb(p, { seedPassword: 'pw' });
  assert.equal(api.update('umum', 999999, { nama: 'x' }), null);
  assert.equal(api.remove('umum', 999999), false);
  api.close();
  cleanup(p);
});

test('rejects unknown collection names instead of touching the DB', () => {
  const p = tmpDbPath();
  const api = createDb(p, { seedPassword: 'pw' });
  assert.throws(() => api.listAll('users'), /unknown collection/);
  assert.throws(() => api.create('drop_table', {}), /unknown collection/);
  api.close();
  cleanup(p);
});
