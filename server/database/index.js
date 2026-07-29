import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'lpse.db')

export function getDb() {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

export function initDb() {
  const db = getDb()
  const schema = fs.readFileSync(
    path.resolve(__dirname, 'schema.sql'),
    'utf-8'
  )
  db.exec(schema)
  return db
}