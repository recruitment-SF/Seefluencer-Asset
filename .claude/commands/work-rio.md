Developer ingin mengerjakan sebuah task (fitur, UI, refactor, bugfix, dll) dengan deskripsi: $ARGUMENTS

**Model: mengikuti model sesi yang sedang aktif (tidak di-pin).**

`/work-rio` memakai workflow compound-engineering yang sama dengan `/debug`, TANPA terikat ticket Notion — jadi lebih general untuk task apa pun yang dideskripsikan langsung oleh developer.

Jalankan langkah berikut secara berurutan:

1. **Pahami task secara kritis & mendetail**

   - Baca deskripsi task dari $ARGUMENTS dengan kritis dan mendetail

   - Tentukan jenis task: `Fitur` / `UI` / `Bugfix` / `Refactor` / `Chore` (dibutuhkan untuk prefix branch di langkah 2)

   - Identifikasi dengan jelas: apa yang sebenarnya diminta, scope, expected behavior, edge case, dan definisi "selesai"

   - **Jika deskripsi ambigu atau kurang detail, tanyakan klarifikasi ke developer SEBELUM lanjut** (scope, expected behavior, acceptance criteria informal, batasan/non-goals)

   - Buat slug pendek dari task (huruf kecil, pisah `-`, maks 4-5 kata) untuk penamaan branch

2. **Setup environment (branch di working directory sesi ini)**

   - Cek branch saat ini:

```bash
rtk git branch --show-current
```

   - **Jika sedang di branch default** (`main`/`master`/`develop`/`seefluencer`/`production` dll):

     - Tanya developer: "Branch baru ini mau dibuat dari branch mana? (contoh: `develop`, `seefluencer`, `production`, atau branch lain?)"

     - Pastikan branch sumber up-to-date:

```bash
rtk git fetch origin {branch-sumber} && rtk git update-ref refs/heads/{branch-sumber} origin/{branch-sumber}
```

     - Tentukan prefix branch berdasarkan jenis task:

       - `Fitur` → `feat/{slug}`

       - `UI` → `ui/{slug}`

       - `Bugfix` → `fix/{slug}`

       - `Refactor`/`Chore` → `chore/{slug}`

     - Buat & checkout branch baru dari branch sumber:

```bash
rtk git checkout -b {prefix}/{slug} {branch-sumber}
```

   - **Jika sudah di branch fitur** (bukan default): tanya developer mau lanjut di branch ini atau buat branch baru (Option di atas)

   - **Opsional (kerja paralel/isolasi penuh)**: kalau developer ingin isolasi penuh / kerja paralel, bisa pakai worktree di `.worktrees/{slug}`:

```bash
mkdir -p .worktrees && rtk git worktree add -b {prefix}/{slug} .worktrees/{slug} {branch-sumber}
```
     Default cukup branch biasa di working directory sesi ini — worktree hanya jika diminta.

   - Konfirmasi ke developer branch kerja yang aktif

3. **Scan codebase untuk konteks, reuse, & gap**

   - Telusuri file/area yang relevan dengan task (gunakan grep/glob + baca file terkait)

   - Manfaatkan knowledge system repo lebih dulu: cek `memory/MEMORY.md`, `CLAUDE.md`, dan cari di `docs/solutions/` untuk area yang disentuh

   - Untuk `Fitur`: cari pattern/komponen/helper/type/hook existing yang bisa **di-reuse**; identifikasi titik integrasi & data layer (`app/actions/**` vs `app/api/**` vs `app/services/**`), serta gating/auth (`app/lib/permissions.ts`, layout guard) jika relevan

   - Untuk `UI`: cari design-system convention & komponen existing — **cek DUA tree** (`app/components/**` dan top-level `components/**`) sebelum bikin baru; ikuti Tailwind/Radix pattern yang ada

   - Bandingkan apa yang diminta vs kondisi codebase saat ini, cari secara spesifik:

     - **Gap**: apa yang belum ada / belum sesuai dengan yang diharapkan

     - **Ketidaksinkronan**: asumsi di deskripsi task yang ternyata tidak cocok dengan implementasi aktual

     - **Dependency tersembunyi & area yang berpotensi terkena dampak** (untuk mencegah efek domino)

   - Identifikasi: file terkait yang akan diubah, file baru yang perlu dibuat, dan utility/komponen existing yang bisa di-reuse

4. **Riset dokumentasi & solusi terkini (Context7 + Exa)** — adaptive

   - Identifikasi keyword riset dari hasil langkah 1 & 3: area/module, teknologi/library yang terlibat, error message (jika bugfix)

   - **Context7** untuk dokumentasi resmi library/framework: resolve library ID dulu (`resolve-library-id`), lalu query docs (`query-docs`) dengan topik spesifik dari task

   - **Exa** untuk solusi/best practices/pattern terkini: `web_search_exa` dengan query spesifik, lalu `web_fetch_exa` untuk halaman paling relevan

   - **Catatan**: jika task straightforward dan tidak melibatkan library/API eksternal, riset bisa minimal; jika kompleks atau memakai teknologi yang jarang dipakai, riset harus lebih mendalam

5. **Diskusi & planning — GATE sebelum implementasi**

   Sampaikan ke developer hasil langkah 1, 3, dan 4 secara ringkas dan terstruktur:

   - Hal-hal penting & temuan dari task

   - File terkait yang akan diubah / file baru yang perlu dibuat

   - Gap / ketidaksinkronan yang ditemukan, dan potensi efek domino

   - Rekomendasi pendekatan berdasarkan riset

   **Bersikap sebagai partner berpikir kritis, BUKAN "Yes Man":**

   - Jangan setuju secara default — nilai dulu apakah pendekatan benar-benar tepat, lalu sampaikan pendapat

   - Push back dengan alasan konkret (bug, risk security/performa, jalur yang lebih sederhana, asumsi yang salah, konvensi yang dilanggar) beserta bukti (file/doc) — bukan sekadar opini

   - Utamakan **best practice**, **reuse** (cari komponen/helper/type/hook existing dulu sebelum bikin baru), **clean code**, **security**, dan **optimasi**

   - **Hindari efek domino**: analisis dampak perubahan ke area lain sebelum eksekusi, baik untuk fitur baru maupun fix

   **Tentukan bobot planning:**

   - **Task ringan** → buat rencana singkat (inline): daftar perubahan, file yang disentuh, urutan kerja

   - **Task berat** (cross-cutting, keputusan arsitektur, menyentuh auth/payment/migration, atau banyak file) → buat plan lengkap via `/ce-plan`

   **Tunggu kesepakatan developer atas rencana sebelum lanjut ke implementasi.**

6. **Kerjakan task menggunakan compound-engineering:ce-work skill**

   - **Pastikan working directory & branch kerja sudah benar** (langkah 2) sebelum mulai mengerjakan

   - Berikan context lengkap ke ce-work: jenis task, scope, expected behavior, **hasil scan codebase (langkah 3)**, **hasil riset (langkah 4)**, dan **rencana yang sudah disepakati (langkah 5)**

   - ce-work akan mengimplementasi perubahan mengikuti rencana yang disepakati

   - Untuk `Fitur`/`UI`: fokus implementasi sesuai scope, reuse komponen existing, ikuti pattern repo

   - Untuk `Bugfix`: fokus root cause analysis dan fix, gunakan temuan riset untuk validasi solusi

   - Selalu jaga: reuse, clean code, security, dan optimasi; jangan menimbulkan efek domino

   - Jika perlu install dependencies: `rtk pnpm install` (atau di dalam worktree bila memakai worktree)

7. **Setelah pengerjaan selesai — catat learning (knowledge system)**

   - Sesuai konvensi repo (`CLAUDE.md` § Knowledge system): jika ada hal **non-obvious** dari fitur/fix ini, catat di `memory/` (+ pointer satu baris di `memory/MEMORY.md`), atau `docs/solutions/<category>/` untuk bug yang sudah dipecahkan

   - Bisa juga jalankan `/ce-compound` untuk merekam learning secara terstruktur

   - Jangan catat hal yang sudah jelas dari kode/git history — fokus pada *why* dan gotcha

8. **Commit, push, dan buat PR menggunakan compound-engineering:ce-commit-push-pr**

   - Sebelum commit, tanya developer: "Branch target untuk PR ini apa? (contoh: `develop`, `seefluencer`, atau branch lain?)"

   - Setelah developer konfirmasi branch target, jalankan skill `compound-engineering:ce-commit-push-pr`

   - Skill ini akan:

     - Membuat commit dengan pesan yang jelas dan value-first

     - Push branch ke remote

     - Membuat PR dari branch `{prefix}/{slug}` ke branch target

   - Tampilkan link PR ke developer setelah selesai

   - **Catatan**: jika memakai worktree, folder `.worktrees/{slug}` bisa dihapus setelah PR di-merge dengan: `rtk git worktree remove .worktrees/{slug}`
