Buat daily standup report untuk Rio.

Jalankan langkah berikut:

1. **Tanyakan branch**
   Tanya developer: "Mau narik history commit dari branch mana? (contoh: `seefluencer`, `develop`, `production`, atau branch lain?)"

2. **Fetch commit kemarin**
   Setelah developer pilih branch, jalankan:
   ```bash
   rtk git log {branch} --author=riofach --since="yesterday 00:00" --until="today 00:00" --pretty=format:"%s" --no-merges
   ```
   Jika branch remote, fetch dulu:
   ```bash
   rtk git fetch origin {branch}
   ```
   Lalu gunakan `origin/{branch}` untuk git log.

3. **Format output**
   Tulis hasil dalam format berikut (ganti tanggal dengan tanggal kemarin, dan isi bullet points dari commit messages):

   ```
   Daily Standup ({DD/MM/YYYY}) – Rio

   :white_check_mark: Yesterday – apa yang dikerjakan kemarin
   - {commit message 1}
   - {commit message 2}
   - {commit message 3}
   ```

   - Gunakan tanggal kemarin (bukan hari ini) pada header
   - Setiap commit message jadi satu bullet point
   - Jika tidak ada commit kemarin, sampaikan: "Tidak ada commit dari riofach di branch {branch} untuk kemarin."
   - Rapikan commit message agar mudah dibaca (hilangkan prefix seperti `fix:`, `feat:`, dll jika perlu, tapi tetap pertahankan konteks)
