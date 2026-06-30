Developer ingin mengerjakan ticket Notion dengan nomor: $ARGUMENTS

**Model yang digunakan: claude-sonnet-4-6 (Sonnet 4.6) — selalu gunakan model ini.**

Jalankan langkah berikut secara berurutan:

1. **Fetch ticket dari Notion**

   - Search Notion untuk ticket dengan Ticket No = $ARGUMENTS (format CRCL-xxx)

   - Fetch isi lengkap ticket: judul, type, Deskripsi & Tujuan, Area/Module, Current vs Expected, Acceptance Criteria, Test Case

   - Tampilkan ringkasan ticket ke developer

   - Catat tipe ticket: `BUG` / `Fitur` / `UI` (dibutuhkan untuk penamaan branch di langkah 3)

2. **Update status ticket ke "In Progress"**

   - Update property Status ticket tersebut menjadi "In Progress" di Notion

3. **Buat worktree + branch baru di folder `.worktrees/`**

   - Tanya developer: "Worktree baru ini mau dibuat (copy) dari branch mana? (contoh: `develop`, `seefluencer`, `production`, atau branch lain?)"

   - Setelah developer konfirmasi branch sumber, pastikan branch tersebut up-to-date:

```bash
rtk git fetch origin {branch-sumber} && rtk git update-ref refs/heads/{branch-sumber} origin/{branch-sumber}
```

   - Tentukan prefix branch berdasarkan tipe ticket:

     - `BUG` → `bug/CRCL-xxx/{keterangan-singkat}`

     - `Fitur` → `feat/CRCL-xxx/{keterangan-singkat}`

     - `UI` → `ui/CRCL-xxx/{keterangan-singkat}`

   - Ganti `{keterangan-singkat}` dengan slug pendek (huruf kecil, pisah `-`, maks 4-5 kata)

   - Buat folder `.worktrees/` jika belum ada, lalu buat worktree dengan branch baru:

```bash
mkdir -p .worktrees && rtk git worktree add -b {prefix}/CRCL-xxx/{keterangan} .worktrees/CRCL-xxx {branch-sumber}
```

   - Konfirmasi ke developer bahwa worktree sudah dibuat di `.worktrees/CRCL-xxx` dari `{branch-sumber}`

   - **Penting**: Mulai saat ini, SEMUA pekerjaan (baca, scan, edit file, run command, dll) dilakukan di dalam worktree `.worktrees/CRCL-xxx`

4. **Baca ticket secara kritis & mendetail**

   - Baca ulang seluruh isi ticket secara mendalam: Deskripsi & Tujuan, Current vs Expected, Acceptance Criteria, dan Test Case

   - Identifikasi dengan jelas: apa yang sebenarnya diminta, batasan/scope, edge case, dan definisi "selesai" yang sebenarnya

   - Untuk `BUG`: pahami gejala, langkah reproduksi, dan dugaan area penyebab

   - Untuk `Fitur`/`UI`: pahami expected behavior, flow, dan dependency antar bagian

   - Catat poin yang ambigu atau belum jelas untuk ditanyakan ke developer pada langkah diskusi (langkah 7)

5. **Scan codebase di worktree untuk cari gap / ketidaksinkronan**

   - Pastikan scope scan berada di dalam worktree `.worktrees/CRCL-xxx`

   - Telusuri file/area yang relevan dengan ticket (gunakan grep/glob + baca file terkait)

   - Bandingkan apa yang diminta ticket vs kondisi codebase saat ini, cari secara spesifik:

     - **Gap**: apa yang belum ada / belum sesuai dengan Expected

     - **Ketidaksinkronan**: asumsi di ticket yang ternyata tidak cocok dengan implementasi aktual

     - **Dependency tersembunyi & area yang berpotensi terkena dampak** (untuk mencegah efek domino)

   - Identifikasi: file terkait yang akan diubah, file baru yang perlu dibuat, dan pattern/utility/komponen existing yang bisa di-reuse

6. **Riset dokumentasi & solusi terkini (Context7 + Exa)** — adaptive

   - Identifikasi keyword riset dari hasil langkah 4–5: area/module, error message (jika BUG), teknologi/library yang terlibat

   - **Context7** untuk dokumentasi resmi library/framework: resolve library ID dulu (`resolve-library-id`), lalu query docs (`query-docs`) dengan topik spesifik dari ticket

   - **Exa** untuk solusi/best practices/diskusi terkini: `web_search_exa` dengan query spesifik, lalu `web_fetch_exa` untuk halaman paling relevan

   - **Catatan**: jika ticket straightforward dan tidak melibatkan library/API eksternal, riset bisa minimal; jika kompleks atau memakai teknologi yang jarang dipakai, riset harus lebih mendalam

7. **Diskusi & planning — GATE sebelum implementasi**

   Sampaikan ke developer hasil langkah 4–6 secara ringkas dan terstruktur:

   - Hal-hal penting & temuan dari ticket

   - File terkait yang akan diubah / file baru yang perlu dibuat

   - Gap / ketidaksinkronan yang ditemukan, dan potensi efek domino

   - Rekomendasi pendekatan berdasarkan riset

   **Bersikap sebagai partner berpikir kritis, BUKAN "Yes Man":**

   - Jangan setuju secara default — nilai dulu apakah pendekatan benar-benar tepat, lalu sampaikan pendapat

   - Push back dengan alasan konkret (bug, risk security/performa, jalur yang lebih sederhana, asumsi yang salah, konvensi yang dilanggar) beserta bukti (file/doc) — bukan sekadar opini

   - Utamakan **best practice**, **reuse** (cari komponen/helper/type/hook existing dulu sebelum bikin baru), **clean code**, **security**, dan **optimasi**

   - **Hindari efek domino**: analisis dampak perubahan ke area lain sebelum eksekusi, baik untuk fix bug maupun fitur baru

   **Tentukan bobot planning:**

   - **Task ringan** → buat rencana singkat (inline): daftar perubahan, file yang disentuh, urutan kerja

   - **Task berat** (cross-cutting, keputusan arsitektur, menyentuh auth/payment/migration, atau banyak file) → buat plan lengkap via `/ce-plan`

   **Tunggu kesepakatan developer atas rencana sebelum lanjut ke implementasi.**

8. **Kerjakan ticket menggunakan compound-engineering:ce-work skill**

   - **Pastikan working directory adalah `.worktrees/CRCL-xxx`** sebelum mulai mengerjakan

   - Berikan context lengkap ke ce-work: tipe, area/module, current vs expected, acceptance criteria, test case, **hasil scan codebase (langkah 5)**, **hasil riset (langkah 6)**, dan **rencana yang sudah disepakati (langkah 7)**

   - ce-work akan mengimplementasi perubahan mengikuti rencana yang sudah disepakati

   - Untuk tipe `BUG`: fokus pada root cause analysis dan fix, gunakan temuan riset untuk validasi solusi

   - Untuk tipe `Fitur`/`UI`: fokus pada implementasi sesuai scope dan acceptance criteria, ikuti pattern dari riset

   - Jika perlu install dependencies di worktree: `cd .worktrees/CRCL-xxx && rtk pnpm install`

9. **Setelah pengerjaan selesai**

   - Tanya developer apakah ingin update ticket di Notion (PR/note, status ke "Code Review", atau catatan lain)

10. **Commit, push, dan buat PR menggunakan compound-engineering:ce-commit-push-pr**

   - **Pastikan working directory masih di `.worktrees/CRCL-xxx`**

   - Sebelum commit, tanya developer: "Branch target untuk PR ini apa? (contoh: `develop`, `seefluencer`, atau branch lain?)"

   - Setelah developer konfirmasi branch target, jalankan skill `compound-engineering:ce-commit-push-pr`

   - Skill ini akan:

     - Membuat commit dengan pesan yang jelas dan value-first

     - Push branch ke remote

     - Membuat PR dari branch `{prefix}/CRCL-xxx/{keterangan}` ke branch target

   - Tampilkan link PR ke developer setelah selesai

   - **Catatan**: Worktree di `.worktrees/CRCL-xxx` bisa dihapus setelah PR di-merge dengan: `rtk git worktree remove .worktrees/CRCL-xxx`
