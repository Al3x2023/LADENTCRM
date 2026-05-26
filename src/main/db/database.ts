import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { SCHEMA } from './schema'
import { hashPassword } from '../utils/security'

let db: Database.Database

export const IMAGES_DIR = join(app.getPath('userData'), 'patient_images')

export function initDatabase(): Database.Database {
  try {
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

    // Agregar tratamientos iniciales si la tabla está vacía
    const treatmentsCount = db.prepare('SELECT COUNT(*) as count FROM treatments').get() as any
    if (treatmentsCount.count === 0) {
      const treatments = [
        // SERVICIOS DIAGNOSTICOS
        ['Radiografia Panoramica', 'service', 50, 1],
        ['Radiografia Periapical', 'service', 25, 1],
        ['Tomografia Cone Beam CBCT', 'service', 150, 1],

        // TRATAMIENTOS BASICOS
        ['Limpieza Profunda (Tartrectomia)', 'treatment', 100, 1],
        ['Profilaxis Dental', 'treatment', 50, 1],
        ['Aplicacion de Fluor', 'treatment', 30, 1],
        ['Sellante de Fosas y Fisuras', 'treatment', 40, 1],

        // ENDODONCIA
        ['Tratamiento de Conducto Unirradicular', 'treatment', 300, 1],
        ['Tratamiento de Conducto Birradicular', 'treatment', 400, 1],
        ['Tratamiento de Conducto Multirradicular', 'treatment', 500, 1],
        ['Retratamiento de Conducto', 'treatment', 350, 1],

        // PERIODONCIA
        ['Curetaje Subgingival (por cuadrante)', 'treatment', 150, 1],
        ['Destartaje Subgingival', 'treatment', 100, 1],
        ['Injerto de Tejido Gingival', 'treatment', 500, 1],

        // CIRUGIA
        ['Extraccion Dental Simple', 'treatment', 200, 1],
        ['Extraccion Dental Compleja/Impactada', 'treatment', 400, 1],
        ['Extraccion de Cordales', 'treatment', 350, 1],
        ['Elevacion de Seno Maxilar', 'treatment', 600, 1],

        // IMPLANTOLOGIA
        ['Colocacion de Implante Dental', 'treatment', 800, 1],
        ['Carga Inmediata de Implante', 'treatment', 900, 1],
        ['Regeneracion Osea Guiada', 'treatment', 700, 1],

        // PROTESIS
        ['Corona Dental (Porcelana)', 'treatment', 600, 1],
        ['Puente Dental (3 elementos)', 'treatment', 1200, 1],
        ['Protesis Parcial Removible', 'treatment', 500, 1],
        ['Protesis Total', 'treatment', 1000, 1],
        ['Incrustacion Dental', 'treatment', 400, 1],

        // ORTODONCIA
        ['Aparatologia Fija Completa', 'treatment', 3000, 1],
        ['Aparatologia Removible', 'treatment', 800, 1],
        ['Consulta Ortodoncia', 'treatment', 150, 1],

        // BLANQUEAMIENTO
        ['Blanqueamiento en Consultorio', 'treatment', 300, 1],
        ['Kit Blanqueamiento Casero', 'treatment', 200, 1],

        // MATERIALES
        ['Composite Restauracion', 'material', 80, 0],
        ['Ionómero de Vidrio', 'material', 60, 0],
        ['Amalgama Dental', 'material', 50, 0],
        ['Cemento Definitivo', 'material', 40, 0],
      ]

      const stmt = db.prepare(`
        INSERT INTO treatments (name, category, price, apply_tax)
        VALUES (?, ?, ?, ?)
      `)

      for (const t of treatments) {
        stmt.run(...t)
      }
    }

    return db
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
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
