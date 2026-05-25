import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { SCHEMA } from './schema'
import { hashPassword } from '../utils/security'

let db: Database.Database

export const IMAGES_DIR = join(app.getPath('userData'), 'patient_images')

export function initDatabase(): Database.Database {
  const dbPath = join(app.getPath('userData'), 'liadent.db')

  if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)

  // Crear usuario administrador inicial si no existe
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin')
  if (!adminExists) {
    const hashedPassword = hashPassword('admin123')
    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hashedPassword, 'Administrador Sistema', 'admin')
  }

  return db
}

export function getDb(): Database.Database {
  if (!db) {
    return initDatabase()
  }
  return db
}

export function logAction(userId: number | null, action: string, module: string, details?: string) {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (user_id, action, module, details)
    VALUES (?, ?, ?, ?)
  `)
  return stmt.run(userId, action, module, details || null)
}
