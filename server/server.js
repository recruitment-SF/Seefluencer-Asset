'use strict';

// Express app: session, auth gate, gated static frontend, and the CRUD API.

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const { createDb } = require('./db');
const { sessionOptions, verifyLogin, requireAuth } = require('./auth');

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const store = createDb(DB_PATH);
store.seedIfEmpty();

const app = express();
app.locals.store = store;
app.set('trust proxy', 1); // TLS terminates at the proxy (Traefik/nginx) in front
app.use(express.json());
app.use(cookieSession(sessionOptions()));

// ---- Public routes (registered before the auth gate) ----
app.get('/login', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/');
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = verifyLogin(store, email, password);
  if (!user) return res.status(401).json({ error: 'Email atau password salah.' });
  req.session.user = user;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// ---- Auth gate: everything below requires a session ----
app.use(requireAuth);

// ---- Data API (gated) ----
function validCollection(req, res, next) {
  if (!store.COLLECTIONS.includes(req.params.c)) {
    return res.status(404).json({ error: 'unknown collection' });
  }
  next();
}

app.get('/api/all', (req, res) => {
  res.json({
    umum: store.listAll('umum'),
    tb: store.listAll('tb'),
    hp: store.listAll('hp'),
    habis: store.listAll('habis'),
  });
});

app.get('/api/:c', validCollection, (req, res) => res.json(store.listAll(req.params.c)));

app.post('/api/:c', validCollection, (req, res) =>
  res.status(201).json(store.create(req.params.c, req.body || {}))
);

app.put('/api/:c/:id', validCollection, (req, res) => {
  const updated = store.update(req.params.c, Number(req.params.id), req.body || {});
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

app.delete('/api/:c/:id', validCollection, (req, res) => {
  if (!store.remove(req.params.c, Number(req.params.id))) {
    return res.status(404).json({ error: 'not found' });
  }
  res.json({ ok: true });
});

// ---- Gated static app ----
app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Asset Management running on http://localhost:${PORT} (DB: ${DB_PATH})`);
  });
}

module.exports = app;
