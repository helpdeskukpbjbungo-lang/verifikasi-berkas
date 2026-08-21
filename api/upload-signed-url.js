import express from 'express'
import { supabase } from '../server/lib/supabase.js'

const app = express()
app.use(express.json())

app.post('/generate', async (req, res) => {
  try {
    const { bucket, path, contentType } = req.body

    if (!bucket || !path) {
      return res.status(400).json({ error: 'Bucket dan path wajib diisi' })
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, 60)

    if (error) {
      console.error('Error generating signed URL:', error)
      return res.status(500).json({ error: 'Gagal membuat URL upload' })
    }

    res.json({
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
    })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    res.status(500).json({ error: 'Gagal membuat URL upload' })
  }
})

export default app
