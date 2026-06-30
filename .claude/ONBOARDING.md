/# Onboarding Claude Code — Tim Seefluencer

Panduan setup Claude Code untuk QA dan Developer agar bisa menggunakan `/bug` dan `/debug` commands yang terhubung ke Notion.

---

## 1. Install Claude Code

Download dan install Claude Code:
- **Desktop app**: https://claude.ai/download
- **VS Code extension**: cari "Claude Code" di Extensions marketplace
- **CLI**: `npm install -g @anthropic-ai/claude-code`

Login dengan akun Anthropic yang sudah di-invite ke tim.

---

## 2. Enable Plugin: compound-engineering

Plugin ini dibutuhkan oleh `/debug` command untuk systematic root cause analysis.

1. Buka Claude Code
2. Masuk ke **Settings → Plugins / Marketplace**
3. Cari **"compound-engineering"** → Enable
4. Restart Claude Code

---

## 3. Connect Notion
Install Notion MCP
Integration ini dibutuhkan agar `/bug` dan `/debug` bisa baca/tulis ke Notion workspace Seefluencer.

1. Buka Claude Code
2. Install notion mcp : ```claude mcp add --transport http notion https://mcp.notion.com/mcp```
3. lalu ketik /mcp
4. Cari **Notion** → klik **Connect**
5. Login dengan akun Notion Seefluencer kamu
6. Authorize akses ke workspace **"Seefluencer"** (atau workspace yang berisi database Tech)

---

## 4. Clone / Pull Repo

Commands `/bug` dan `/debug` sudah ada di dalam repo di `.claude/commands/`. Cukup pull repo terbaru:

```bash
git pull origin seefluencer
```

Setelah pull, commands langsung aktif saat Claude Code dibuka di folder project ini.

---

## 5. Verifikasi Setup

Buka Claude Code di folder project, lalu coba:

```
/bug test apakah command ini berjalan
```

Kalau Claude merespons dengan pertanyaan clarifying (area, reproduce steps, dll) → setup berhasil ✅

---

## Cara Pakai

### QA — Melaporkan Bug

```
/bug [deskripsi singkat bug]
```

Contoh:
```
/bug voucher bootcamp tidak ter-apply saat checkout, harga tidak berubah
```

Claude akan tanya detail tambahan jika perlu, brainstorm root cause, lalu otomatis buat ticket di Notion dengan nomor CRCL-xxx.

---

### Developer — Debug Ticket

```
/debug CRCL-xxx
```

Contoh:
```
/debug CRCL-358
```

Claude akan fetch ticket dari Notion, update status ke "In Progress", lalu mulai systematic debugging di codebase.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `/bug` tidak muncul sebagai command | Pastikan sudah pull repo terbaru |
| Notion tidak bisa diakses | Re-connect Notion di Settings → Integrations |
| `/debug` tidak jalankan debugging yang dalam | Pastikan plugin compound-engineering sudah enabled |
| Command muncul tapi tidak ada respons | Coba restart Claude Code |