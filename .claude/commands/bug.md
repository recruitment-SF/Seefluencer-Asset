QA melaporkan bug dengan info: $ARGUMENTS

**Model yang digunakan: claude-sonnet-4-6 (Sonnet 4.6) — selalu gunakan model ini untuk semua debugging dan fixing.**

Jalankan langkah berikut:

1. **Clarifying questions (jika info kurang lengkap)**
   Tanya QA untuk info yang belum ada:
   - Area/module mana yang bermasalah?
   - Langkah-langkah untuk reproduce bug?
   - Expected behavior vs actual behavior?
   - User/role yang terdampak?
   - Severity: Critical / High / Medium / Low?
   - Link ke project Notion yang relevan (atau buat project baru)?

2. **Brainstorming dengan compound-engineering:ce-debug approach**
   - Analisis kemungkinan root cause berdasarkan deskripsi
   - Identifikasi area kode yang kemungkinan terdampak
   - Tentukan severity dan impact
   - Susun reproduction steps yang terstruktur

3. **Buat bug ticket di Notion**
   - Cari project yang relevan di Notion (jika disebutkan), atau tanya project mana
   - Buat ticket baru di Tasks database dengan:
     - type = BUG
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

4. **Konfirmasi ke QA**
   - Tampilkan link ticket yang baru dibuat
   - Sebutkan nomor CRCL-xxx yang di-assign otomatis
