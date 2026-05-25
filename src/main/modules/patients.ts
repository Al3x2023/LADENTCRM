import { ipcMain, dialog } from 'electron'
import { copyFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { getDb, IMAGES_DIR, logAction } from '../db/database'
import { encrypt, decrypt } from '../utils/security'

export function setupPatientsHandlers() {
  const db = getDb()

  ipcMain.handle('get-patients', () => {
    const patients = db.prepare('SELECT * FROM patients ORDER BY name').all()
    return patients.map((p: any) => ({
      ...p,
      id_number: decrypt(p.id_number)
    }))
  })

  ipcMain.handle('add-patient', (_, patient) => {
    const stmt = db.prepare(`
      INSERT INTO patients (name, id_number, email, phone, birth_date, address, notes, allergies, blood_type, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(
      patient.name,
      patient.id_number ? encrypt(patient.id_number) : null,
      patient.email,
      patient.phone,
      patient.birth_date,
      patient.address,
      patient.notes,
      patient.allergies || null,
      patient.blood_type || null,
      patient.gender || null
    )
    
    logAction(null, 'CREATE', 'PATIENTS', `Paciente creado: ${patient.name}`)
    return info.lastInsertRowid
  })

  ipcMain.handle('update-patient', (_, patient) => {
    const stmt = db.prepare(`
      UPDATE patients 
      SET name = ?, id_number = ?, email = ?, phone = ?, birth_date = ?, address = ?, 
          notes = ?, allergies = ?, blood_type = ?, gender = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = stmt.run(
      patient.name,
      patient.id_number ? encrypt(patient.id_number) : null,
      patient.email,
      patient.phone,
      patient.birth_date,
      patient.address,
      patient.notes,
      patient.allergies,
      patient.blood_type,
      patient.gender,
      patient.id
    )
    
    logAction(null, 'UPDATE', 'PATIENTS', `Paciente actualizado ID: ${patient.id}`)
    return result.changes
  })

  ipcMain.handle('upload-patient-image', async (_, { patientId, category }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'webp'] }]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const sourcePath = result.filePaths[0]
      const fileName = `${Date.now()}_${patientId}_${result.filePaths[0].split(/[\\/]/).pop()}`
      const destPath = join(IMAGES_DIR, fileName)

      copyFileSync(sourcePath, destPath)

      const stmt = db.prepare('INSERT INTO patient_images (patient_id, file_name, category) VALUES (?, ?, ?)')
      stmt.run(patientId, fileName, category)

      logAction(null, 'UPLOAD_IMAGE', 'PATIENTS', `Imagen subida para paciente ID: ${patientId}`)
      return { success: true, fileName }
    }
    return { success: false }
  })

  ipcMain.handle('get-patient-images', (_, patientId) => {
    return db.prepare('SELECT * FROM patient_images WHERE patient_id = ? ORDER BY uploaded_at DESC').all(patientId)
  })

  ipcMain.handle('get-image-url', (_, fileName) => {
    const filePath = join(IMAGES_DIR, fileName)
    if (existsSync(filePath)) {
      return `file://${filePath}`
    }
    return null
  })

  ipcMain.handle('delete-patient-image', (_, { id, fileName }) => {
    const filePath = join(IMAGES_DIR, fileName)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }
    const result = db.prepare('DELETE FROM patient_images WHERE id = ?').run(id)
    logAction(null, 'DELETE_IMAGE', 'PATIENTS', `Imagen eliminada ID: ${id}`)
    return result
  })
}
