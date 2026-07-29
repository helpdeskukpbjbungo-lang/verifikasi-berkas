CREATE TABLE IF NOT EXISTS pemohon (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_lengkap TEXT NOT NULL,
  nip TEXT NOT NULL,
  jabatan TEXT,
  satker TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengajuan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pemohon_id INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'verified', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pemohon_id) REFERENCES pemohon(id)
);

CREATE TABLE IF NOT EXISTS dokumen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pengajuan_id INTEGER NOT NULL,
  jenis_dokumen TEXT NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  size_bytes INTEGER,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pengajuan_id) REFERENCES pengajuan(id)
);