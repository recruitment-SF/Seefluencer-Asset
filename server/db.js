'use strict';

// SQLite data layer. One table per collection (row-per-record + JSON `data`
// column), plus a `users` table for login. See the plan's KTD2/KTD3.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const seed = require('./seed');

const COLLECTIONS = ['umum', 'tb', 'hp', 'habis'];
const DEFAULT_EMAIL = 'admin@seefluencer.com';
const DEFAULT_PASSWORD = 'seefluencer123';
const BCRYPT_ROUNDS = 10;

/**
 * Open (or create) the database at `dbPath` and return a small API.
 * `opts.seedEmail` / `opts.seedPassword` override the env defaults (used by tests).
 */
function createDb(dbPath, opts = {}) {
  const dir = path.dirname(dbPath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  for (const c of COLLECTIONS) {
    db.exec(
      `CREATE TABLE IF NOT EXISTS ${c} (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL)`
    );
  }
  db.exec(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

  function assertCollection(c) {
    if (!COLLECTIONS.includes(c)) {
      const err = new Error('unknown collection: ' + c);
      err.code = 'UNKNOWN_COLLECTION';
      throw err;
    }
  }

  function listAll(c) {
    assertCollection(c);
    return db
      .prepare(`SELECT id, data FROM ${c} ORDER BY id`)
      .all()
      .map((r) => ({ ...JSON.parse(r.data), id: r.id }));
  }

  function create(c, obj) {
    assertCollection(c);
    const { id: _ignore, ...rest } = obj || {};
    const info = db.prepare(`INSERT INTO ${c}(data) VALUES(?)`).run(JSON.stringify(rest));
    return { ...rest, id: Number(info.lastInsertRowid) };
  }

  function update(c, id, obj) {
    assertCollection(c);
    const { id: _ignore, ...rest } = obj || {};
    const info = db.prepare(`UPDATE ${c} SET data=? WHERE id=?`).run(JSON.stringify(rest), id);
    if (info.changes === 0) return null;
    return { ...rest, id: Number(id) };
  }

  function remove(c, id) {
    assertCollection(c);
    return db.prepare(`DELETE FROM ${c} WHERE id=?`).run(id).changes > 0;
  }

  function findUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').trim().toLowerCase());
  }

  /** Insert seed data and the default account only when the tables are empty. */
  function seedIfEmpty() {
    const seedEmail = (opts.seedEmail || process.env.AUTH_SEED_EMAIL || DEFAULT_EMAIL)
      .trim()
      .toLowerCase();
    const seedPassword = opts.seedPassword || process.env.AUTH_SEED_PASSWORD || DEFAULT_PASSWORD;

    const insertMany = db.transaction((c, rows) => {
      const stmt = db.prepare(`INSERT INTO ${c}(data) VALUES(?)`);
      for (const row of rows) {
        const { id: _ignore, ...rest } = row;
        stmt.run(JSON.stringify(rest));
      }
    });

    for (const c of COLLECTIONS) {
      const count = db.prepare(`SELECT COUNT(*) AS n FROM ${c}`).get().n;
      if (count === 0) insertMany(c, seed[c] || []);
    }

    const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
    if (userCount === 0) {
      const hash = bcrypt.hashSync(seedPassword, BCRYPT_ROUNDS);
      db.prepare('INSERT INTO users(email, password_hash, created_at) VALUES(?,?,?)').run(
        seedEmail,
        hash,
        new Date().toISOString()
      );
      if (seedPassword === DEFAULT_PASSWORD) {
        console.warn(
          '[auth] WARNING: seeded login uses the DEFAULT password. Set AUTH_SEED_PASSWORD ' +
            'to a strong value before real use.'
        );
      }
    }
  }

  return {
    db,
    COLLECTIONS,
    listAll,
    create,
    update,
    remove,
    findUserByEmail,
    seedIfEmpty,
    close: () => db.close(),
  };
}

module.exports = { createDb, COLLECTIONS, DEFAULT_EMAIL, DEFAULT_PASSWORD };
