import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './database/index.js'
import pengajuanRoutes from './routes/pengajuan.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/pengajuan', pengajuanRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const server = app.listen(PORT, () => {
  initDb()
  console.log(`LPSE API server running on http://localhost:${PORT}`)
})

export default server