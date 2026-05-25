import { ipcMain } from 'electron'
import { getDb, logAction } from '../db/database'
import { hashPassword, verifyPassword } from '../utils/security'

export function setupAuthHandlers() {
  const db = getDb()

  ipcMain.handle('login', (_, { username, password }) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username) as any
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    if (!verifyPassword(password, user.password_hash)) {
      logAction(user.id, 'LOGIN_FAILED', 'AUTH', `Intento fallido para usuario: ${username}`)
      return { success: false, error: 'Contraseña incorrecta' }
    }

    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id)
    logAction(user.id, 'LOGIN', 'AUTH', `Inicio de sesión exitoso`)

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        email: user.email
      }
    }
  })

  ipcMain.handle('get-users', () => {
    return db.prepare('SELECT id, username, full_name, role, email, active, last_login, created_at FROM users ORDER BY full_name').all()
  })

  ipcMain.handle('add-user', (_, { username, password, full_name, role, email }) => {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
      return { success: false, error: 'El nombre de usuario ya existe' }
    }
    const hashedPassword = hashPassword(password)
    const info = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, email)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, hashedPassword, full_name, role || 'receptionist', email || null)

    logAction(null, 'CREATE_USER', 'AUTH', `Usuario creado: ${username}`)
    return { success: true, id: info.lastInsertRowid }
  })

  ipcMain.handle('update-user', (_, { id, full_name, role, email, active }) => {
    db.prepare(`
      UPDATE users SET full_name = ?, role = ?, email = ?, active = ?
      WHERE id = ?
    `).run(full_name, role, email || null, active ? 1 : 0, id)
    logAction(null, 'UPDATE_USER', 'AUTH', `Usuario actualizado ID: ${id}`)
    return { success: true }
  })

  ipcMain.handle('change-password', (_, { id, currentPassword, newPassword }) => {
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id) as any
    if (!user || !verifyPassword(currentPassword, user.password_hash)) {
      return { success: false, error: 'Contraseña actual incorrecta' }
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), id)
    logAction(id, 'CHANGE_PASSWORD', 'AUTH', `Contraseña cambiada para usuario ID: ${id}`)
    return { success: true }
  })

  ipcMain.handle('get-audit-logs', (_, { limit, offset } = { limit: 100, offset: 0 }) => {
    const logs = db.prepare(`
      SELECT al.*, u.username, u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset)
    const total = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as any
    return { logs, total: total.count }
  })

  ipcMain.handle('get-staff', () => {
    return db.prepare(`
      SELECT s.*, u.username, u.full_name, u.role, u.email, u.active
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY u.full_name
    `).all()
  })

  ipcMain.handle('add-staff', (_, { userId, specialty, licenseNumber, phone }) => {
    const info = db.prepare(`
      INSERT INTO staff (user_id, specialty, license_number, phone)
      VALUES (?, ?, ?, ?)
    `).run(userId, specialty || null, licenseNumber || null, phone || null)
    logAction(null, 'CREATE_STAFF', 'STAFF', `Personal creado para usuario ID: ${userId}`)
    return { success: true, id: info.lastInsertRowid }
  })

  ipcMain.handle('update-staff', (_, { id, specialty, licenseNumber, phone, active }) => {
    db.prepare(`
      UPDATE staff SET specialty = ?, license_number = ?, phone = ?, active = ?
      WHERE id = ?
    `).run(specialty || null, licenseNumber || null, phone || null, active ? 1 : 0, id)
    logAction(null, 'UPDATE_STAFF', 'STAFF', `Personal actualizado ID: ${id}`)
    return { success: true }
  })

  ipcMain.handle('delete-patient', (_, id) => {
    db.prepare('DELETE FROM patient_images WHERE patient_id = ?').run(id)
    db.prepare('DELETE FROM clinical_notes WHERE patient_id = ?').run(id)
    db.prepare('DELETE FROM prescriptions WHERE patient_id = ?').run(id)
    db.prepare('DELETE FROM odontograms WHERE patient_id = ?').run(id)
    db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(id)
    db.prepare('DELETE FROM invoices WHERE patient_id = ?').run(id)
    const result = db.prepare('DELETE FROM patients WHERE id = ?').run(id)
    logAction(null, 'DELETE', 'PATIENTS', `Paciente eliminado ID: ${id}`)
    return result.changes
  })
}
