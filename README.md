# Verifikasi Berkas - LPSE Portal

Full-stack web application for LPSE (Lembaga Pengelola Sistem Elektronik) verification form submissions.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **File Upload**: Multer

## Project Structure

```
verifikasi-berkas/
├── server/
│   ├── index.js          # Express server entry point
│   ├── database/
│   │   ├── index.js      # Database connection & initialization
│   │   └── schema.sql    # Database schema (SQL)
│   └── routes/
│       └── pengajuan.js  # API routes for form submissions
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Main app layout
│   ├── index.css         # Tailwind CSS + custom styles
│   ├── components/
│   │   ├── TopNavBar.jsx
│   │   ├── SideNavBar.jsx
│   │   ├── FileUploadCard.jsx
│   │   └── InfoCard.jsx
│   └── pages/
│       └── PengajuanForm.jsx
├── uploads/              # Uploaded PDF files
├── data/                 # SQLite database file
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Database Schema

### pemohon
Stores applicant personal data.

| Column       | Type    | Description                    |
|-------------|---------|--------------------------------|
| id          | INTEGER | Primary key, auto-increment    |
| nama_lengkap| TEXT    | Full name                      |
| nip         | TEXT    | NIP (Nomor Induk Pegawai)      |
| jabatan     | TEXT    | Position/title                 |
| satker      | TEXT    | Satuan Kerja (Work unit)       |
| created_at  | DATETIME| Record creation timestamp      |
| updated_at  | DATETIME| Last update timestamp          |

### pengajuan
Stores submission records linked to applicants.

| Column    | Type    | Description                              |
|----------|---------|------------------------------------------|
| id       | INTEGER | Primary key, auto-increment              |
| pemohon_id| INTEGER| Foreign key to pemohon.id                |
| status   | TEXT    | draft, submitted, verified, rejected     |
| created_at| DATETIME| Record creation timestamp               |
| updated_at| DATETIME| Last update timestamp                   |

### dokumen
Stores uploaded document metadata linked to submissions.

| Column      | Type    | Description                          |
|------------|---------|--------------------------------------|
| id         | INTEGER | Primary key, auto-increment          |
| pengajuan_id| INTEGER| Foreign key to pengajuan.id          |
| jenis_dokumen| TEXT  | surat_permohonan, pakta_integritas, sk_terbaru |
| filename   | TEXT    | Original file name                   |
| filepath   | TEXT    | Stored file path on disk             |
| size_bytes | INTEGER | File size in bytes                   |
| uploaded_at| DATETIME| Upload timestamp                     |

## Setup & Running

```bash
# Install dependencies
npm install

# Start both frontend and backend (development)
npm run dev

# Start only the backend server
npm run server

# Build for production
npm run build
```

## API Endpoints

- `POST /api/pengajuan` - Submit a new verification application with form data and PDF files
- `GET /api/pengajuan` - List all submissions
- `GET /api/pengajuan/:id` - Get submission details by ID
- `PUT /api/pengajuan/:id/status` - Update submission status
- `GET /api/health` - Health check

## File Uploads

- Accepted format: PDF only
- Maximum file size: 2MB per file
- Uploaded files are stored in the `uploads/` directory