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

  // Agregar tratamientos iniciales si la tabla está vacía
  const treatmentsCount = db.prepare('SELECT COUNT(*) as count FROM treatments').get() as any
  if (treatmentsCount.count === 0) {
    const treatments = [
      // SERVICIOS DIAGNOSTICOS
      ['Radiografia Panoramica', 'Imaging', 'service', 50, true],
      ['Radiografia Periapical', 'Imaging', 'service', 25, true],
      ['Tomografia Cone Beam CBCT', 'Imaging', 'service', 150, true],

      // TRATAMIENTOS BASICOS
      ['Limpieza Profunda (Tartrectomia)', 'Preventiva', 'treatment', 100, true],
      ['Profilaxis Dental', 'Preventiva', 'treatment', 50, true],
      ['Aplicacion de Fluor', 'Preventiva', 'treatment', 30, true],
      ['Sellante de Fosas y Fisuras', 'Preventiva', 'treatment', 40, true],

      // ENDODONCIA
      ['Tratamiento de Conducto Unirradicular', 'Endodoncia', 'treatment', 300, true],
      ['Tratamiento de Conducto Birradicular', 'Endodoncia', 'treatment', 400, true],
      ['Tratamiento de Conducto Multirradicular', 'Endodoncia', 'treatment', 500, true],
      ['Retratamiento de Conducto', 'Endodoncia', 'treatment', 350, true],

      // PERIODONCIA
      ['Curetaje Subgingival (por cuadrante)', 'Periodoncia', 'treatment', 150, true],
      ['Destartaje Subgingival', 'Periodoncia', 'treatment', 100, true],
      ['Injerto de Tejido Gingival', 'Periodoncia', 'treatment', 500, true],

      // CIRUGIA
      ['Extraccion Dental Simple', 'Cirugia', 'treatment', 200, true],
      ['Extraccion Dental Compleja/Impactada', 'Cirugia', 'treatment', 400, true],
      ['Extraccion de Cordales', 'Cirugia', 'treatment', 350, true],
      ['Elevacion de Seno Maxilar', 'Cirugia', 'treatment', 600, true],

      // IMPLANTOLOGIA
      ['Colocacion de Implante Dental', 'Implantologia', 'treatment', 800, true],
      ['Carga Inmediata de Implante', 'Implantologia', 'treatment', 900, true],
      ['Regeneracion Osea Guiada', 'Implantologia', 'treatment', 700, true],

      // PROTESIS
      ['Corona Dental (Porcelana)', 'Protesis', 'treatment', 600, true],
      ['Puente Dental (3 elementos)', 'Protesis', 'treatment', 1200, true],
      ['Protesis Parcial Removible', 'Protesis', 'treatment', 500, true],
      ['Protesis Total', 'Protesis', 'treatment', 1000, true],
      ['Incrustacion Dental', 'Protesis', 'treatment', 400, true],

      // ORTODONCIA
      ['Aparatologia Fija Completa', 'Ortodoncia', 'treatment', 3000, true],
      ['Aparatologia Removible', 'Ortodoncia', 'treatment', 800, true],
      ['Consulta Ortodoncia', 'Ortodoncia', 'treatment', 150, true],

      // BLANQUEAMIENTO
      ['Blanqueamiento en Consultorio', 'Estetica', 'treatment', 300, true],
      ['Kit Blanqueamiento Casero', 'Estetica', 'treatment', 200, true],

      // MATERIALES
      ['Composite Restauracion', 'Material', 'material', 80, false],
      ['Ionómero de Vidrio', 'Material', 'material', 60, false],
      ['Amalgama Dental', 'Material', 'material', 50, false],
      ['Cemento Definitivo', 'Material', 'material', 40, false],
    ]

    const stmt = db.prepare(`
      INSERT INTO treatments (name, description, category, price, apply_tax)
      VALUES (?, ?, ?, ?, ?)
    `)

    for (const t of treatments) {
      stmt.run(...t)
    }
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
