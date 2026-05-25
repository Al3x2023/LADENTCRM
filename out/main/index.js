"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const Database = require("better-sqlite3");
const fs = require("fs");
const crypto = require("crypto");
const SCHEMA = `
  -- Usuarios y Permisos
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'doctor', 'receptionist')) DEFAULT 'receptionist',
    email TEXT,
    mfa_enabled INTEGER DEFAULT 0,
    mfa_secret TEXT,
    active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Auditoría de Acciones
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Pacientes (Extendido)
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    id_number TEXT UNIQUE, -- DNI/Passport
    email TEXT,
    phone TEXT,
    birth_date TEXT,
    address TEXT,
    gender TEXT,
    blood_type TEXT,
    allergies TEXT,
    medical_history_summary TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Personal Médico
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    specialty TEXT,
    license_number TEXT,
    phone TEXT,
    active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Agenda y Citas (Extendido)
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER DEFAULT 30, -- minutos
    reason TEXT,
    status TEXT CHECK(status IN ('pending', 'arrived', 'in_progress', 'completed', 'cancelled', 'postponed')) DEFAULT 'pending',
    cost REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES staff(id)
  );

  -- Historial Clínico Electrónico (HCE) - Notas de Evolución
  CREATE TABLE IF NOT EXISTS clinical_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_id INTEGER,
    content TEXT NOT NULL,
    vitals_signs TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES staff(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
  );

  -- Recetas Médicas
  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    medications TEXT NOT NULL, -- JSON string or formatted text
    instructions TEXT,
    expires_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES staff(id)
  );

  -- Facturación
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT,
    total_amount REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    status TEXT CHECK(status IN ('draft', 'issued', 'paid', 'partially_paid', 'cancelled')) DEFAULT 'issued',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  -- Detalles de Factura
  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );

  -- Odontogramas
  CREATE TABLE IF NOT EXISTS odontograms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  -- Imágenes de Pacientes
  CREATE TABLE IF NOT EXISTS patient_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    file_name TEXT NOT NULL,
    category TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );
`;
const ALGORITHM = "aes-256-cbc";
const KEY = crypto.scryptSync("liadent-secret-key-2026", "salt", 32);
const IV_LENGTH = 16;
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decrypt(text) {
  if (!text || !text.includes(":")) return text;
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
let db;
const IMAGES_DIR = path.join(electron.app.getPath("userData"), "patient_images");
function initDatabase() {
  const dbPath = path.join(electron.app.getPath("userData"), "liadent.db");
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  const adminExists = db.prepare("SELECT id FROM users WHERE role = ?").get("admin");
  if (!adminExists) {
    const hashedPassword = hashPassword("admin123");
    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run("admin", hashedPassword, "Administrador Sistema", "admin");
  }
  return db;
}
function getDb() {
  if (!db) {
    return initDatabase();
  }
  return db;
}
function logAction(userId, action, module, details) {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (user_id, action, module, details)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(userId, action, module, details || null);
}
function setupPatientsHandlers() {
  const db2 = getDb();
  electron.ipcMain.handle("get-patients", () => {
    const patients = db2.prepare("SELECT * FROM patients ORDER BY name").all();
    return patients.map((p) => ({
      ...p,
      id_number: decrypt(p.id_number)
    }));
  });
  electron.ipcMain.handle("add-patient", (_, patient) => {
    const stmt = db2.prepare(`
      INSERT INTO patients (name, id_number, email, phone, birth_date, address, notes, allergies, blood_type, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
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
    );
    logAction(null, "CREATE", "PATIENTS", `Paciente creado: ${patient.name}`);
    return info.lastInsertRowid;
  });
  electron.ipcMain.handle("update-patient", (_, patient) => {
    const stmt = db2.prepare(`
      UPDATE patients 
      SET name = ?, id_number = ?, email = ?, phone = ?, birth_date = ?, address = ?, 
          notes = ?, allergies = ?, blood_type = ?, gender = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
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
    );
    logAction(null, "UPDATE", "PATIENTS", `Paciente actualizado ID: ${patient.id}`);
    return result.changes;
  });
  electron.ipcMain.handle("upload-patient-image", async (_, { patientId, category }) => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "png", "jpeg", "webp"] }]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const sourcePath = result.filePaths[0];
      const fileName = `${Date.now()}_${patientId}_${result.filePaths[0].split(/[\\/]/).pop()}`;
      const destPath = path.join(IMAGES_DIR, fileName);
      fs.copyFileSync(sourcePath, destPath);
      const stmt = db2.prepare("INSERT INTO patient_images (patient_id, file_name, category) VALUES (?, ?, ?)");
      stmt.run(patientId, fileName, category);
      logAction(null, "UPLOAD_IMAGE", "PATIENTS", `Imagen subida para paciente ID: ${patientId}`);
      return { success: true, fileName };
    }
    return { success: false };
  });
  electron.ipcMain.handle("get-patient-images", (_, patientId) => {
    return db2.prepare("SELECT * FROM patient_images WHERE patient_id = ? ORDER BY uploaded_at DESC").all(patientId);
  });
  electron.ipcMain.handle("get-image-url", (_, fileName) => {
    const filePath = path.join(IMAGES_DIR, fileName);
    if (fs.existsSync(filePath)) {
      return `file://${filePath}`;
    }
    return null;
  });
  electron.ipcMain.handle("delete-patient-image", (_, { id, fileName }) => {
    const filePath = path.join(IMAGES_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const result = db2.prepare("DELETE FROM patient_images WHERE id = ?").run(id);
    logAction(null, "DELETE_IMAGE", "PATIENTS", `Imagen eliminada ID: ${id}`);
    return result;
  });
}
function setupAppointmentsHandlers() {
  const db2 = getDb();
  electron.ipcMain.handle("get-appointments", () => {
    return db2.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as phone, s.specialty as doctor_specialty
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      LEFT JOIN staff s ON a.doctor_id = s.id
      ORDER BY date, time
    `).all();
  });
  electron.ipcMain.handle("add-appointment", (_, appointment) => {
    const stmt = db2.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, date, time, duration, reason, cost, paid) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      appointment.patient_id,
      appointment.doctor_id || null,
      appointment.date,
      appointment.time,
      appointment.duration || 30,
      appointment.reason,
      appointment.cost || 0,
      appointment.paid || 0
    );
    logAction(null, "CREATE", "APPOINTMENTS", `Cita creada para paciente ID: ${appointment.patient_id}`);
    return info.lastInsertRowid;
  });
  electron.ipcMain.handle("update-appointment-status", (_, id, status) => {
    const stmt = db2.prepare("UPDATE appointments SET status = ? WHERE id = ?");
    const result = stmt.run(status, id);
    logAction(null, "UPDATE_STATUS", "APPOINTMENTS", `Estado de cita ${id} cambiado a ${status}`);
    return result.changes;
  });
  electron.ipcMain.handle("update-appointment-payment", (_, { id, paid }) => {
    const result = db2.prepare("UPDATE appointments SET paid = ? WHERE id = ?").run(paid, id);
    logAction(null, "UPDATE_PAYMENT", "APPOINTMENTS", `Pago de cita ${id} actualizado a ${paid}`);
    return result.changes;
  });
  electron.ipcMain.handle("get-dashboard-stats", () => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const totalPatients = db2.prepare("SELECT COUNT(*) as count FROM patients").get();
    const todayAppointments = db2.prepare("SELECT COUNT(*) as count FROM appointments WHERE date = ?").get(today);
    const nextAppointment = db2.prepare(`
      SELECT time FROM appointments 
      WHERE date = ? AND time >= strftime('%H:%M', 'now', 'localtime') 
      AND status NOT IN ('cancelled', 'completed')
      ORDER BY time LIMIT 1
    `).get(today);
    return {
      totalPatients: totalPatients.count,
      todayAppointments: todayAppointments.count,
      nextAppointmentTime: nextAppointment ? nextAppointment.time : "No hay más hoy"
    };
  });
}
function setupClinicalHandlers() {
  const db2 = getDb();
  electron.ipcMain.handle("get-odontogram", (_, patientId) => {
    return db2.prepare("SELECT * FROM odontograms WHERE patient_id = ?").get(patientId);
  });
  electron.ipcMain.handle("save-odontogram", (_, { patientId, data }) => {
    const existing = db2.prepare("SELECT id FROM odontograms WHERE patient_id = ?").get(patientId);
    let result;
    if (existing) {
      result = db2.prepare("UPDATE odontograms SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE patient_id = ?").run(data, patientId);
    } else {
      result = db2.prepare("INSERT INTO odontograms (patient_id, data) VALUES (?, ?)").run(patientId, data);
    }
    logAction(null, "SAVE_ODONTOGRAM", "CLINICAL", `Odontograma guardado para paciente ID: ${patientId}`);
    return result;
  });
  electron.ipcMain.handle("get-clinical-notes", (_, patientId) => {
    return db2.prepare(`
      SELECT n.*, s.specialty, u.full_name as doctor_name
      FROM clinical_notes n
      LEFT JOIN staff s ON n.doctor_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE n.patient_id = ?
      ORDER BY n.created_at DESC
    `).all(patientId);
  });
  electron.ipcMain.handle("add-clinical-note", (_, note) => {
    const stmt = db2.prepare(`
      INSERT INTO clinical_notes (patient_id, doctor_id, appointment_id, content, vitals_signs)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      note.patient_id,
      note.doctor_id || null,
      note.appointment_id || null,
      note.content,
      note.vitals_signs ? JSON.stringify(note.vitals_signs) : null
    );
    logAction(null, "CREATE_NOTE", "CLINICAL", `Nota clínica creada para paciente ID: ${note.patient_id}`);
    return info.lastInsertRowid;
  });
  electron.ipcMain.handle("get-prescriptions", (_, patientId) => {
    return db2.prepare(`
      SELECT r.*, u.full_name as doctor_name
      FROM prescriptions r
      LEFT JOIN staff s ON r.doctor_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE r.patient_id = ?
      ORDER BY r.date DESC
    `).all(patientId);
  });
  electron.ipcMain.handle("add-prescription", (_, prescription) => {
    const stmt = db2.prepare(`
      INSERT INTO prescriptions (patient_id, doctor_id, medications, instructions, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      prescription.patient_id,
      prescription.doctor_id || null,
      prescription.medications,
      prescription.instructions,
      prescription.expires_at
    );
    logAction(null, "CREATE_PRESCRIPTION", "CLINICAL", `Receta creada para paciente ID: ${prescription.patient_id}`);
    return info.lastInsertRowid;
  });
}
function setupBillingHandlers() {
  const db2 = getDb();
  electron.ipcMain.handle("get-invoices", (_, patientId) => {
    let query = `
      SELECT i.*, p.name as patient_name
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
    `;
    if (patientId) {
      query += " WHERE i.patient_id = ?";
      return db2.prepare(query + " ORDER BY i.issue_date DESC").all(patientId);
    }
    return db2.prepare(query + " ORDER BY i.issue_date DESC").all();
  });
  electron.ipcMain.handle("create-invoice", (_, { invoice, items }) => {
    const transaction = db2.transaction(() => {
      const stmtInvoice = db2.prepare(`
        INSERT INTO invoices (patient_id, invoice_number, issue_date, due_date, total_amount, tax_amount, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmtInvoice.run(
        invoice.patient_id,
        invoice.invoice_number,
        invoice.issue_date,
        invoice.due_date,
        invoice.total_amount,
        invoice.tax_amount || 0,
        invoice.status || "issued",
        invoice.notes
      );
      const invoiceId = info.lastInsertRowid;
      const stmtItem = db2.prepare(`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const item of items) {
        stmtItem.run(invoiceId, item.description, item.quantity, item.unit_price, item.total_price);
      }
      logAction(null, "CREATE_INVOICE", "BILLING", `Factura creada: ${invoice.invoice_number}`);
      return invoiceId;
    });
    return transaction();
  });
  electron.ipcMain.handle("get-invoice-details", (_, invoiceId) => {
    const invoice = db2.prepare("SELECT * FROM invoices WHERE id = ?").get(invoiceId);
    const items = db2.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(invoiceId);
    return { invoice, items };
  });
  electron.ipcMain.handle("update-invoice-status", (_, { id, status }) => {
    const result = db2.prepare("UPDATE invoices SET status = ? WHERE id = ?").run(status, id);
    logAction(null, "UPDATE_INVOICE_STATUS", "BILLING", `Estado de factura ${id} cambiado a ${status}`);
    return result.changes;
  });
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    title: "LIADENT CRM - Gestión Odontológica Profesional",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.liadent.crm");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  initDatabase();
  setupPatientsHandlers();
  setupAppointmentsHandlers();
  setupClinicalHandlers();
  setupBillingHandlers();
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
