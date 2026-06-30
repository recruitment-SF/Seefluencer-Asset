Request perubahan dengan info: $ARGUMENTS

**Model yang digunakan: claude-sonnet-4-6 (Sonnet 4.6) — selalu gunakan model ini.**

Gunakan command ini untuk: modifikasi UI, tambah/hapus fitur kecil, perubahan flow, penyesuaian teks/label, atau improvement non-bug.

Jalankan langkah berikut:

1. **Clarifying questions (jika info kurang lengkap)**
   Tanya untuk info yang belum ada:
   - Jenis perubahan: UI / Fitur / Flow?
   - Area/module mana yang perlu diubah?
   - Apa yang ingin ditambah, dihapus, atau diubah?
   - Alasan/tujuan perubahan ini?
   - User/role yang terdampak?
   - Priority: High / Medium / Low?
   - Link ke project Notion yang relevan (atau buat project baru)?

2. **Tentukan tipe ticket**
   Pilih berdasarkan konteks:
   - `UI` — perubahan tampilan, layout, warna, label, teks, spacing
   - `Fitur` — tambah/hapus/modifikasi fungsi, flow, behavior, atau logic

3. **Buat ticket di Notion**
   - Cari project yang relevan di Notion (jika disebutkan), atau tanya project mana
   - Buat ticket baru di Tasks database dengan:
     - type = `UI` atau `Fitur` (sesuai konteks)
     - Status = Backlog
     - Konten menggunakan template lengkap:

   ```
   **Deskripsi & Tujuan :**
   **User / Role Terdampak:**
   **Area / Module:**
   **Current vs Expected:**
   **Dependency:**
   **Scope:**
   - 
   **Acceptance Criteria:**
   - [ ] 
   **Assets & Reference:**
   **Test Case:**
   | Test Case ID | Test Scenario | Precondition | Test Steps | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
   ```

4. **Konfirmasi**
   - Tampilkan link ticket yang baru dibuat
   - Sebutkan nomor CRCL-xxx yang di-assign otomatis
