# Seefluencer — HRGA Asset Management System

Aplikasi manajemen aset internal (Inventaris Umum, Habis Pakai, Jadwal Perawatan,
Aset Tidak Bergerak, Hak Paten & Merek, Laporan) untuk PT. Seefluencer Digital Kreatif.

Stack: **Node.js + Express + SQLite (better-sqlite3)** dengan frontend HTML/JS vanilla.
Data tersimpan di server (dibagikan ke semua pengguna), dikunci di balik **form login**
berbasis akun di database. Dideploy sebagai **satu image Docker** untuk VPS atau Dokploy.

---

## Konfigurasi (environment variables)

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `PORT` | tidak | `3000` | Port HTTP yang didengarkan app (proxy/Traefik merutekan ke sini). |
| `DB_PATH` | tidak | `./data/app.db` | Path file SQLite. Di Docker/Dokploy gunakan `/data/app.db` (volume). |
| `COOKIE_SECRET` | **ya (produksi)** | acak per-boot | Kunci penandatangan cookie sesi. Jika kosong, sesi reset tiap restart. |
| `AUTH_SEED_EMAIL` | tidak | `admin@seefluencer.com` | Email akun default (dibuat sekali, saat DB pertama kali kosong). |
| `AUTH_SEED_PASSWORD` | tidak | `seefluencer123` | Password akun default. **Ganti sebelum dipakai sungguhan.** |
| `NODE_ENV` | tidak | `development` | `production` mengaktifkan flag cookie `Secure` (butuh proxy TLS di depan). |

> Akun login hanya dibuat **sekali**, saat database masih kosong. Mengubah
> `AUTH_SEED_*` setelah DB terisi tidak mengubah akun yang sudah ada — buat akun baru
> langsung di tabel `users` atau hapus database untuk re-seed.

---

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env   # lalu sesuaikan nilainya
npm start              # http://localhost:3000
```

Menjalankan test:

```bash
npm test               # node --test (db, auth, server)
```

---

## Deploy di VPS (Docker)

```bash
# build
docker build -t seefluencer-asset .

# jalankan dengan named volume agar database persisten lintas redeploy
docker run -d --name asset-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e COOKIE_SECRET="$(openssl rand -hex 32)" \
  -e AUTH_SEED_EMAIL="admin@seefluencer.com" \
  -e AUTH_SEED_PASSWORD="GANTI_PASSWORD_KUAT" \
  -v assetdata:/data \
  seefluencer-asset
```

Letakkan reverse proxy (nginx/Caddy/Traefik) di depan untuk HTTPS + domain. Database
(file `app.db` beserta sidecar WAL) berada di volume `assetdata` dan bertahan saat
container di-restart atau di-update.

---

## Deploy di Dokploy

1. Buat **Application** baru, arahkan ke repository ini.
2. **Build Type:** `Dockerfile` (Dokploy memakai `Dockerfile` di root).
3. **Volume (penting):** tambahkan **named volume** dengan Mount Path `/data`
   (Advanced → Volumes). Ini menyimpan database secara persisten dan mendukung
   fitur backup volume Dokploy.
   - ⚠️ Volume Dokploy dimiliki `root`. Image ini sengaja berjalan sebagai `root`
     agar penulisan SQLite tidak gagal-diam. Jangan ubah user container menjadi
     non-root tanpa menyesuaikan kepemilikan `/data`.
4. **Environment:** set `NODE_ENV=production`, `COOKIE_SECRET` (string acak panjang),
   `AUTH_SEED_EMAIL`, `AUTH_SEED_PASSWORD`. `DB_PATH` & `PORT` sudah benar dari image.
5. **Domain/HTTPS:** dikelola oleh Traefik bawaan Dokploy — app cukup bicara HTTP.
   Opsional: tambahkan Basic Auth Traefik di depan sebagai lapisan ekstra.

---

## Akun default & keamanan

- Login pertama memakai `AUTH_SEED_EMAIL` / `AUTH_SEED_PASSWORD`
  (default: `admin@seefluencer.com` / `seefluencer123`).
- **Wajib ganti** password default lewat `AUTH_SEED_PASSWORD` pada deploy pertama
  (saat DB masih kosong). App akan mencetak peringatan jika password default dipakai.
- Password disimpan ter-hash (bcrypt). Sesi memakai cookie httpOnly bertanda tangan.

---

## Backup & catatan

- **Backup:** salin file database dari volume (`/data/app.db`), atau pakai
  **Volume Backup** Dokploy (hanya untuk named volume, bukan bind mount).
- **Konkurensi:** edit bersifat per-baris (cukup untuk tim kecil); dua orang yang
  mengedit *record yang sama persis* bersamaan menerapkan aturan last-write-wins.
- **Skala:** frontend memuat seluruh record sekali saat load — nyaman untuk ribuan
  aset; pagination/pencarian sisi-server dapat ditambahkan jika data tumbuh sangat besar.
