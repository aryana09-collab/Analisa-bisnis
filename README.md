# FinLens — Platform Analisis Keuangan AI

Platform analisis keuangan berbasis AI untuk pebisnis Indonesia.

## Cara Deploy ke Vercel

1. Upload semua file ini ke GitHub repository
2. Buka vercel.com
3. Klik "New Project"
4. Import dari GitHub
5. Klik Deploy

## Struktur Project

```
finlens-nextjs/
├── components/
│   └── App.jsx          # Komponen utama (semua UI & logic)
├── pages/
│   ├── _app.jsx         # App wrapper
│   └── index.jsx        # Halaman utama
├── styles/
│   └── globals.css      # Global styles
├── package.json
├── next.config.js
└── .gitignore
```

## Fitur
- Landing page
- Sistem daftar & login (OTP, password)
- Dashboard multi perusahaan
- Analisis 31 rasio keuangan
- Early Warning System
- Benchmark industri
- Export PDF
- AI Chat
- Halaman paket (Trial, Plan A, Plan B)
