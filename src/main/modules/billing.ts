import { ipcMain } from 'electron'
import { getDb, logAction } from '../db/database'

export function setupBillingHandlers() {
  const db = getDb()

  ipcMain.handle('get-invoices', (_, patientId?: number) => {
    let query = `
      SELECT i.*, p.name as patient_name
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
    `
    if (patientId) {
      query += ' WHERE i.patient_id = ?'
      return db.prepare(query + ' ORDER BY i.issue_date DESC').all(patientId)
    }
    return db.prepare(query + ' ORDER BY i.issue_date DESC').all()
  })

  ipcMain.handle('create-invoice', (_, { invoice, items }) => {
    const transaction = db.transaction(() => {
      const stmtInvoice = db.prepare(`
        INSERT INTO invoices (patient_id, invoice_number, issue_date, due_date, total_amount, tax_amount, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      const info = stmtInvoice.run(
        invoice.patient_id,
        invoice.invoice_number,
        invoice.issue_date,
        invoice.due_date,
        invoice.total_amount,
        invoice.tax_amount || 0,
        invoice.status || 'issued',
        invoice.notes
      )
      
      const invoiceId = info.lastInsertRowid

      const stmtItem = db.prepare(`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `)

      for (const item of items) {
        stmtItem.run(invoiceId, item.description, item.quantity, item.unit_price, item.total_price)
      }

      logAction(null, 'CREATE_INVOICE', 'BILLING', `Factura creada: ${invoice.invoice_number}`)
      return invoiceId
    })

    return transaction()
  })

  ipcMain.handle('get-invoice-details', (_, invoiceId) => {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId)
    return { invoice, items }
  })

  ipcMain.handle('update-invoice-status', (_, { id, status }) => {
    const result = db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(status, id)
    logAction(null, 'UPDATE_INVOICE_STATUS', 'BILLING', `Estado de factura ${id} cambiado a ${status}`)
    return result.changes
  })
}
