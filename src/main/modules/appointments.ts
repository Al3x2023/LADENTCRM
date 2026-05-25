import { ipcMain } from 'electron'
import { getDb, logAction } from '../db/database'

export function setupAppointmentsHandlers() {
  const db = getDb()

  ipcMain.handle('get-appointments', () => {
    return db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as phone, s.specialty as doctor_specialty
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      LEFT JOIN staff s ON a.doctor_id = s.id
      ORDER BY date, time
    `).all()
  })

  ipcMain.handle('add-appointment', (_, appointment) => {
    const stmt = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, date, time, duration, reason, cost, paid) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(
      appointment.patient_id,
      appointment.doctor_id || null,
      appointment.date,
      appointment.time,
      appointment.duration || 30,
      appointment.reason,
      appointment.cost || 0,
      appointment.paid || 0
    )
    
    logAction(null, 'CREATE', 'APPOINTMENTS', `Cita creada para paciente ID: ${appointment.patient_id}`)
    return info.lastInsertRowid
  })

  ipcMain.handle('update-appointment-status', (_, id: number, status: string) => {
    const stmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?')
    const result = stmt.run(status, id)
    
    logAction(null, 'UPDATE_STATUS', 'APPOINTMENTS', `Estado de cita ${id} cambiado a ${status}`)
    return result.changes
  })

  ipcMain.handle('update-appointment-payment', (_, { id, paid }) => {
    const result = db.prepare('UPDATE appointments SET paid = ? WHERE id = ?').run(paid, id)
    logAction(null, 'UPDATE_PAYMENT', 'APPOINTMENTS', `Pago de cita ${id} actualizado a ${paid}`)
    return result.changes
  })

  ipcMain.handle('get-dashboard-stats', () => {
    const today = new Date().toISOString().split('T')[0]
    
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get() as any
    const todayAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(today) as any
    const nextAppointment = db.prepare(`
      SELECT time FROM appointments 
      WHERE date = ? AND time >= strftime('%H:%M', 'now', 'localtime') 
      AND status NOT IN ('cancelled', 'completed')
      ORDER BY time LIMIT 1
    `).get(today) as any

    return {
      totalPatients: totalPatients.count,
      todayAppointments: todayAppointments.count,
      nextAppointmentTime: nextAppointment ? nextAppointment.time : 'No hay más hoy'
    }
  })
}
