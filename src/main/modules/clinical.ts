import { ipcMain } from 'electron'
import { getDb, logAction } from '../db/database'

export function setupClinicalHandlers() {
  const db = getDb()

  // Odontogramas
  ipcMain.handle('get-odontogram', (_, patientId) => {
    return db.prepare('SELECT * FROM odontograms WHERE patient_id = ?').get(patientId)
  })

  ipcMain.handle('save-odontogram', (_, { patientId, data }) => {
    const existing = db.prepare('SELECT id FROM odontograms WHERE patient_id = ?').get(patientId)
    let result
    if (existing) {
      result = db.prepare('UPDATE odontograms SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE patient_id = ?').run(data, patientId)
    } else {
      result = db.prepare('INSERT INTO odontograms (patient_id, data) VALUES (?, ?)').run(patientId, data)
    }
    
    logAction(null, 'SAVE_ODONTOGRAM', 'CLINICAL', `Odontograma guardado para paciente ID: ${patientId}`)
    return result
  })

  // Notas Clínicas
  ipcMain.handle('get-clinical-notes', (_, patientId) => {
    return db.prepare(`
      SELECT n.*, s.specialty, u.full_name as doctor_name
      FROM clinical_notes n
      LEFT JOIN staff s ON n.doctor_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE n.patient_id = ?
      ORDER BY n.created_at DESC
    `).all(patientId)
  })

  ipcMain.handle('add-clinical-note', (_, note) => {
    const stmt = db.prepare(`
      INSERT INTO clinical_notes (patient_id, doctor_id, appointment_id, content, vitals_signs)
      VALUES (?, ?, ?, ?, ?)
    `)
    const info = stmt.run(
      note.patient_id,
      note.doctor_id || null,
      note.appointment_id || null,
      note.content,
      note.vitals_signs ? JSON.stringify(note.vitals_signs) : null
    )
    
    logAction(null, 'CREATE_NOTE', 'CLINICAL', `Nota clínica creada para paciente ID: ${note.patient_id}`)
    return info.lastInsertRowid
  })

  // Recetas
  ipcMain.handle('get-prescriptions', (_, patientId) => {
    return db.prepare(`
      SELECT r.*, u.full_name as doctor_name
      FROM prescriptions r
      LEFT JOIN staff s ON r.doctor_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE r.patient_id = ?
      ORDER BY r.date DESC
    `).all(patientId)
  })

  ipcMain.handle('add-prescription', (_, prescription) => {
    const stmt = db.prepare(`
      INSERT INTO prescriptions (patient_id, doctor_id, medications, instructions, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    const info = stmt.run(
      prescription.patient_id,
      prescription.doctor_id || null,
      prescription.medications,
      prescription.instructions,
      prescription.expires_at
    )
    
    logAction(null, 'CREATE_PRESCRIPTION', 'CLINICAL', `Receta creada para paciente ID: ${prescription.patient_id}`)
    return info.lastInsertRowid
  })
}
