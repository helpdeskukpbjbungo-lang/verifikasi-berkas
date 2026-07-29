import { Router } from 'express'
import { getDb, initDb } from '../database/index.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '..', '..', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, unique + ext)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  },
})

router.post('/pengajuan', (req, res) => {
  try {
    const { nama_lengkap, nip, jabatan, satker } = req.body

    if (!nama_lengkap || !nip) {
      return res.status(400).json({ error: 'Nama Lengkap dan NIP wajib diisi' })
    }

    const db = getDb()
    const insertPemohon = db.prepare(
      'INSERT INTO pemohon (nama_lengkap, nip, jabatan, satker) VALUES (?, ?, ?, ?)'
    )
    const result = insertPemohon.run(nama_lengkap, nip, jabatan || null, satker || null)
    const pemohonId = result.lastInsertRowid

    const insertPengajuan = db.prepare(
      'INSERT INTO pengajuan (pemohon_id, status) VALUES (?, ?)'
    )
    const pengajuanResult = insertPengajuan.run(pemohonId, 'submitted')
    const pengajuanId = pengajuanResult.lastInsertRowid

    const insertDokumen = db.prepare(
      'INSERT INTO dokumen (pengajuan_id, jenis_dokumen, filename, filepath, size_bytes) VALUES (?, ?, ?, ?, ?)'
    )

    const dokumenTypes = ['surat_permohonan', 'pakta_integritas', 'sk_terbaru']
    dokumenTypes.forEach((jenis) => {
      const file = req.files?.[jenis]?.[0]
      if (file) {
        insertDokumen.run(
          pengajuanId,
          jenis,
          file.originalname,
          file.path,
          file.size
        )
      }
    })

    db.close()

    res.status(201).json({
      message: 'Pengajuan berhasil dikirim',
      pengajuanId,
      pemohonId,
    })
  } catch (error) {
    console.error('Error submitting pengajuan:', error)
    res.status(500).json({ error: 'Gagal menyimpan pengajuan' })
  }
})

router.get('/pengajuan', (req, res) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      `SELECT p.id, p.nama_lengkap, p.nip, p.jabatan, p.satker,
       pg.id as pengajuan_id, pg.status, pg.created_at,
       d.id as dokumen_id, d.jenis_dokumen, d.filename, d.size_bytes, d.uploaded_at
       FROM pemohon p
       JOIN pengajuan pg ON p.id = pg.pemohon_id
       LEFT JOIN dokumen d ON pg.id = d.pengajuan_id
       ORDER BY pg.created_at DESC`
    ).all()
    db.close()
    res.json(rows)
  } catch (error) {
    console.error('Error fetching pengajuan:', error)
    res.status(500).json({ error: 'Gagal mengambil data' })
  }
})

router.get('/pengajuan/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = getDb()
    const pemohon = db.prepare(
      'SELECT * FROM pemohon WHERE id = ?'
    ).get(id)

    if (!pemohon) {
      db.close()
      return res.status(404).json({ error: 'Pemohon tidak ditemukan' })
    }

    const pengajuan = db.prepare(
      'SELECT * FROM pengajuan WHERE pemohon_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(pemohon.id)

    const dokumen = db.prepare(
      'SELECT * FROM dokumen WHERE pengajuan_id = ?'
    ).all(pengajuan?.id)

    db.close()
    res.json({ pemohon, pengajuan, dokumen })
  } catch (error) {
    console.error('Error fetching detail:', error)
    res.status(500).json({ error: 'Gagal mengambil detail' })
  }
})

router.put('/pengajuan/:id/status', (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['draft', 'submitted', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' })
    }

    const db = getDb()
    const pengajuan = db.prepare(
      'UPDATE pengajuan SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, id)

    if (pengajuan.changes === 0) {
      db.close()
      return res.status(404).json({ error: 'Pengajuan tidak ditemukan' })
    }

    db.close()
    res.json({ message: 'Status diperbarui', status })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ error: 'Gagal memperbarui status' })
  }
})

export default router