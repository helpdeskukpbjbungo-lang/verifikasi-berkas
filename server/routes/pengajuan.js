import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import multer from 'multer'
import path from 'path'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  },
})

function sanitizeFilenamePart(str) {
  return String(str || '')
    .replace(/[^a-zA-Z0-9 \-_.]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'tanpa-nama'
}

function buildStorageFilename(namaLengkap, jabatan, satker) {
  const nama = sanitizeFilenamePart(namaLengkap)
  const jab = sanitizeFilenamePart(jabatan)
  const sat = sanitizeFilenamePart(satker)
  return `${nama} - ${jab} - ${sat}.pdf`
}

const bucketByJenis = {
  surat_permohonan: 'Surat Permohonan',
  pakta_integritas: 'Pakta Integritas',
  sk_terbaru: 'SK Terbaru',
}

router.post('/pengajuan', upload.fields([
  { name: 'surat_permohonan', maxCount: 1 },
  { name: 'pakta_integritas', maxCount: 1 },
  { name: 'sk_terbaru', maxCount: 1 },
]), async (req, res) => {
  try {
    const { nama_lengkap, nip, jabatan, satker } = req.body

    if (!nama_lengkap || !nip) {
      return res.status(400).json({ error: 'Nama Lengkap dan NIP wajib diisi' })
    }

    const { data: formulir, error: formulirError } = await supabase
      .from('formulir_pengajuan')
      .insert({
        nama_lengkap,
        nip,
        jabatan: jabatan || null,
        satker: satker || null,
        status: 'submitted'
      })
      .select()
      .single()

    if (formulirError || !formulir) {
      throw formulirError || new Error('Gagal menyimpan formulir')
    }

    const formulirId = formulir.id

    const dokumenTypes = ['surat_permohonan', 'pakta_integritas', 'sk_terbaru']
    for (const jenis of dokumenTypes) {
      const file = req.files?.[jenis]?.[0]
      if (!file) continue

      const bucket = bucketByJenis[jenis]
      const filename = buildStorageFilename(nama_lengkap, jabatan, satker)
      const storagePath = `${formulirId}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath)

      const { error: dokumenError } = await supabase
        .from('dokumen')
        .insert({
          formulir_id: formulirId,
          jenis_dokumen: jenis,
          filename,
          filepath: publicUrlData.publicUrl,
          bucket,
          path: storagePath,
          size_bytes: file.size
        })

      if (dokumenError) {
        throw dokumenError
      }
    }

    res.status(201).json({
      message: 'Pengajuan berhasil dikirim. Silahkan Cek Status Pengajuan secara berkala untuk melihat status verifikasi.',
      pengajuanId: formulirId,
      pemohonId: formulirId,
    })
  } catch (error) {
    console.error('Error submitting pengajuan:', error)
    res.status(500).json({ error: 'Gagal menyimpan pengajuan' })
  }
})

router.get('/pengajuan', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('formulir_pengajuan')
      .select(`
        *,
        dokumen (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json(data || [])
  } catch (error) {
    console.error('Error fetching pengajuan:', error)
    res.status(500).json({ error: 'Gagal mengambil data' })
  }
})

router.get('/pengajuan/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: formulir, error: formulirError } = await supabase
      .from('formulir_pengajuan')
      .select('*')
      .eq('id', id)
      .single()

    if (formulirError || !formulir) {
      return res.status(404).json({ error: 'Formulir tidak ditemukan' })
    }

    const { data: dokumen, error: dokumenError } = await supabase
      .from('dokumen')
      .select('*')
      .eq('formulir_id', id)

    if (dokumenError) {
      throw dokumenError
    }

    res.json({ formulir, dokumen: dokumen || [] })
  } catch (error) {
    console.error('Error fetching detail:', error)
    res.status(500).json({ error: 'Gagal mengambil detail' })
  }
})

router.put('/pengajuan/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['draft', 'submitted', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' })
    }

    const { error } = await supabase
      .from('formulir_pengajuan')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return res.status(404).json({ error: 'Pengajuan tidak ditemukan' })
    }

    res.json({ message: 'Status diperbarui', status })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ error: 'Gagal memperbarui status' })
  }
})

export default router