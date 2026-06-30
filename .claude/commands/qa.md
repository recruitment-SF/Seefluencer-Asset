QA ingin melakukan testing untuk ticket Notion dengan nomor: $ARGUMENTS

**Model yang digunakan: claude-sonnet-4-6 (Sonnet 4.6) — selalu gunakan model ini untuk semua testing.**

Jalankan langkah berikut secara berurutan:

1. **Fetch ticket dari Notion**
   - Search Notion untuk ticket dengan Ticket No = $ARGUMENTS (format CRCL-xxx)
   - Fetch isi lengkap ticket: judul, Deskripsi & Tujuan, Area/Module, Current vs Expected, Acceptance Criteria, Test Case
   - Tampilkan ringkasan ticket ke QA termasuk tabel Test Case yang sudah ada

2. **Update status ticket ke "Testing"**
   - Update property Status ticket tersebut menjadi "Testing" di Notion

3. **Siapkan Test Case**
   - Tampilkan tabel Test Case yang ada di ticket:

   ```
   **Test Case:**
   | Test Case ID | Test Scenario | Precondition | Test Steps | Expected Result | Actual Result | Status |
   | --- | --- | --- | --- | --- | --- | --- |
   ```

   - Jika tabel Test Case di ticket masih kosong, generate test cases berdasarkan:
     - Acceptance Criteria di ticket
     - Area/Module yang terdampak
     - Current vs Expected behavior
   - Setiap test case harus mencakup:
     - Happy path (skenario normal berhasil)
     - Edge cases yang relevan dengan bug
     - Regression check area yang mungkin terdampak fix

4. **Manual Testing**
   - Tampilkan instruksi testing ke QA dengan environment yang perlu disiapkan
   - Minta QA untuk melakukan testing manual satu per satu sesuai tabel
   - Setelah QA selesai testing, minta QA input hasil:
     - Actual Result untuk setiap test case
     - Status: ✅ Pass / ❌ Fail / ⏭️ Skip
   - Tampilkan tabel final dengan hasil yang diisi QA

5. **Automation Testing dengan Claude Code**
   - Identifikasi file test yang relevan dengan area/module di ticket:
     - Cari file `*.test.ts` yang terkait
     - Cek area kode yang diubah di branch fix
   - Jalankan test yang relevan:
     ```
     rtk node --test <path-to-relevant-test-file>
     ```
   - Jika belum ada test coverage untuk skenario bug ini, buat test case baru:
     - Tulis test file atau tambahkan test ke file yang sudah ada
     - Pastikan test mencakup: kondisi bug yang dilaporkan + fix yang diimplementasikan
     - Jalankan test baru tersebut
   - Tampilkan hasil automation testing (pass/fail + output)

6. **Evaluasi Hasil Testing**
   - Hitung summary: berapa Pass, Fail, Skip dari manual + automation
   - Tentukan verdict keseluruhan:
     - **✅ PASS**: Semua critical test cases pass, tidak ada regression
     - **❌ FAIL**: Ada test case critical yang fail — perlu dikembalikan ke developer
     - **⚠️ PARTIAL**: Beberapa test fail tapi bukan blocking — dokumentasikan dan diskusikan

7. **Update Notion ticket**
   - Update tabel Test Case di ticket Notion dengan hasil lengkap (Actual Result + Status)
   - Jika **PASS**: Update Status ticket ke "Done"
   - Jika **FAIL**: Update Status ticket ke "In Progress" + tambahkan comment dengan detail failure
   - Jika **PARTIAL**: Diskusikan dengan QA sebelum update status

8. **Konfirmasi ke QA**
   - Tampilkan link ticket Notion yang sudah diupdate
   - Berikan summary hasil testing:
     - Total test cases: X Pass / Y Fail / Z Skip
     - Verdict: PASS / FAIL / PARTIAL
     - Next action (jika ada)
