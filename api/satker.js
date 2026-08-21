import express from 'express'
import { supabase } from '../../server/lib/supabase.js'

const app = express()
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('satker')
      .select('nama_satker')
      .order('nama_satker', { ascending: true })

    if (error) {
      console.error('Error fetching satker:', error)
      return res.status(500).json({ error: 'Gagal memuat data satuan kerja' })
    }

    const mapped = (data || []).map((item, index) => ({
      id: String(index + 1),
      nama: item.nama_satker,
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Error fetching satker:', error)
    res.status(500).json({ error: 'Gagal memuat data satuan kerja' })
  }
})

export default app
