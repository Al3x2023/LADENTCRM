/**
 * LIADENT CRM - Test Suite de Funcionalidades
 * Este archivo simula casos de uso para verificar el correcto funcionamiento
 */

const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuración de prueba
const TEST_DB_PATH = './test_liadent.db';
const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync('liadent-secret-key-2026', 'salt', 32);
const IV_LENGTH = 16;

// Funciones de seguridad
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Schema de la base de datos
const SCHEMA = `
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

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    id_number TEXT UNIQUE,
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

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    specialty TEXT,
    license_number TEXT,
    phone TEXT,
    active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER DEFAULT 30,
    reason TEXT,
    status TEXT CHECK(status IN ('pending', 'arrived', 'in_progress', 'completed', 'cancelled', 'postponed')) DEFAULT 'pending',
    cost REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS clinical_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_id INTEGER,
    content TEXT NOT NULL,
    vitals_signs TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES staff(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    medications TEXT NOT NULL,
    instructions TEXT,
    expires_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES staff(id)
  );

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

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );

  CREATE TABLE IF NOT EXISTS odontograms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS patient_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    file_name TEXT NOT NULL,
    category TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT CHECK(category IN ('treatment', 'material', 'service', 'other')) DEFAULT 'treatment',
    price REAL NOT NULL,
    apply_tax INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

let db;
let testsPassed = 0;
let testsFailed = 0;
const results = [];

function logTest(name, passed, error = null) {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const message = `${status}: ${name}`;
  console.log(message);
  if (error) {
    console.log(`   Error: ${error.message || error}`);
  }
  results.push({ name, passed, error: error?.message || null });
  if (passed) testsPassed++;
  else testsFailed++;
}

function setup() {
  try {
    // Eliminar base de datos de prueba anterior si existe
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    db = new Database(TEST_DB_PATH);
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);

    // Crear usuario administrador
    const hashedPassword = hashPassword('admin123');
    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hashedPassword, 'Administrador Sistema', 'admin');

    // Insertar tratamientos de prueba
    const treatments = [
      ['Limpieza Dental', 'treatment', 100, 1],
      ['Blanqueamiento', 'treatment', 300, 1],
      ['Extraccion', 'treatment', 200, 1],
      ['Composite', 'material', 80, 0],
    ];

    const stmtTreatment = db.prepare('INSERT INTO treatments (name, category, price, apply_tax) VALUES (?, ?, ?, ?)');
    for (const t of treatments) {
      stmtTreatment.run(...t);
    }

    console.log('\n=== SETUP COMPLETADO ===\n');
    return true;
  } catch (error) {
    console.error('Error en setup:', error);
    return false;
  }
}

// ===== CASOS DE PRUEBA =====

function testAuthentication() {
  console.log('\n--- AUTENTICACIÓN ---\n');

  // Test 1: Login exitoso
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get('admin');
    const validPassword = verifyPassword('admin123', user.password_hash);
    logTest('Login con credenciales correctas', validPassword);
  } catch (error) {
    logTest('Login con credenciales correctas', false, error);
  }

  // Test 2: Login fallido
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    const invalidPassword = verifyPassword('wrongpassword', user.password_hash);
    logTest('Login con contraseña incorrecta', !invalidPassword);
  } catch (error) {
    logTest('Login con contraseña incorrecta', false, error);
  }

  // Test 3: Crear nuevo usuario
  try {
    const hashedPassword = hashPassword('test123');
    const info = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, email)
      VALUES (?, ?, ?, ?, ?)
    `).run('dr.test', hashedPassword, 'Dr. Test', 'doctor', 'test@liadent.com');

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    logTest('Crear nuevo usuario', newUser && newUser.username === 'dr.test' && newUser.role === 'doctor');
  } catch (error) {
    logTest('Crear nuevo usuario', false, error);
  }

  // Test 4: Actualizar usuario
  try {
    db.prepare('UPDATE users SET full_name = ?, email = ? WHERE username = ?')
      .run('Dr. Test Actualizado', 'updated@liadent.com', 'dr.test');

    const updated = db.prepare('SELECT * FROM users WHERE username = ?').get('dr.test');
    logTest('Actualizar usuario', updated.full_name === 'Dr. Test Actualizado');
  } catch (error) {
    logTest('Actualizar usuario', false, error);
  }
}

function testPatientManagement() {
  console.log('\n--- GESTIÓN DE PACIENTES ---\n');

  // Test 1: Crear paciente
  let patientId;
  try {
    const info = db.prepare(`
      INSERT INTO patients (name, id_number, email, phone, birth_date, address, allergies, blood_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Juan Pérez',
      encrypt('12345678'),
      'juan@email.com',
      '555-1234',
      '1990-05-15',
      'Calle Principal 123',
      'Penicilina',
      'O+'
    );

    patientId = info.lastInsertRowid;
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    const decryptedDNI = decrypt(patient.id_number);
    logTest('Crear nuevo paciente', patient && decryptedDNI === '12345678');
  } catch (error) {
    logTest('Crear nuevo paciente', false, error);
  }

  // Test 2: Actualizar paciente
  try {
    db.prepare(`
      UPDATE patients SET name = ?, allergies = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run('Juan Pérez García', 'Penicilina, Aspirina', patientId);

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    logTest('Actualizar paciente', updated.name === 'Juan Pérez García');
  } catch (error) {
    logTest('Actualizar paciente', false, error);
  }

  // Test 3: Encriptación de datos sensibles
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    const originalDNI = '12345678';
    const decryptedDNI = decrypt(patient.id_number);
    logTest('Encriptación de datos sensibles', decryptedDNI === originalDNI);
  } catch (error) {
    logTest('Encriptación de datos sensibles', false, error);
  }

  // Test 4: Listar pacientes
  try {
    // Crear segundo paciente
    db.prepare(`
      INSERT INTO patients (name, email, phone, birth_date, address)
      VALUES (?, ?, ?, ?, ?)
    `).run('María López', 'maria@email.com', '555-5678', '1985-10-20', 'Avenida Central 456');

    const patients = db.prepare('SELECT * FROM patients ORDER BY name').all();
    logTest('Listar pacientes', patients.length === 2);
  } catch (error) {
    logTest('Listar pacientes', false, error);
  }

  return patientId;
}

function testAppointments(patientId) {
  console.log('\n--- CITAS ---\n');

  const today = new Date().toISOString().split('T')[0];

  // Test 1: Crear cita
  let appointmentId;
  try {
    const info = db.prepare(`
      INSERT INTO appointments (patient_id, date, time, duration, reason, cost, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(patientId, today, '10:00', 60, 'Limpieza dental', 100, 'pending');

    appointmentId = info.lastInsertRowid;
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    logTest('Crear cita', appointment && appointment.status === 'pending');
  } catch (error) {
    logTest('Crear cita', false, error);
  }

  // Test 2: Actualizar estado de cita
  try {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('arrived', appointmentId);
    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    logTest('Actualizar estado de cita', updated.status === 'arrived');
  } catch (error) {
    logTest('Actualizar estado de cita', false, error);
  }

  // Test 3: Registrar pago parcial
  try {
    db.prepare('UPDATE appointments SET paid = ? WHERE id = ?').run(50, appointmentId);
    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    logTest('Registrar pago parcial', updated.paid === 50);
  } catch (error) {
    logTest('Registrar pago parcial', false, error);
  }

  // Test 4: Citas del día
  try {
    const todayAppointments = db.prepare(`
      SELECT a.*, p.name as patient_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.date = ?
    `).all(today);

    logTest('Obtener citas del día', todayAppointments.length > 0 && todayAppointments[0].patient_name);
  } catch (error) {
    logTest('Obtener citas del día', false, error);
  }

  return appointmentId;
}

function testClinicalFeatures(patientId) {
  console.log('\n--- CLÍNICA ---\n');

  // Test 1: Crear nota clínica
  let noteId;
  try {
    const info = db.prepare(`
      INSERT INTO clinical_notes (patient_id, content, vitals_signs)
      VALUES (?, ?, ?)
    `).run(patientId, 'Paciente presenta caries en molar inferior derecho. Se prescribe tratamiento.', JSON.stringify({ temp: '36.5', bp: '120/80' }));

    noteId = info.lastInsertRowid;
    const note = db.prepare('SELECT * FROM clinical_notes WHERE id = ?').get(noteId);
    const vitals = JSON.parse(note.vitals_signs);
    logTest('Crear nota clínica', note && vitals.temp === '36.5');
  } catch (error) {
    logTest('Crear nota clínica', false, error);
  }

  // Test 2: Crear receta médica
  let prescriptionId;
  try {
    const info = db.prepare(`
      INSERT INTO prescriptions (patient_id, medications, instructions)
      VALUES (?, ?, ?)
    `).run(patientId, 'Ibuprofeno 400mg - 1 tableta cada 8 horas por 5 días', 'Tomar con alimentos');

    prescriptionId = info.lastInsertRowid;
    const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(prescriptionId);
    logTest('Crear receta médica', prescription && prescription.instructions === 'Tomar con alimentos');
  } catch (error) {
    logTest('Crear receta médica', false, error);
  }

  // Test 3: Guardar odontograma
  try {
    const odontogramData = JSON.stringify({
      teeth: {
        '18': { condition: 'healthy', treatments: [] },
        '17': { condition: 'caries', treatments: ['filling'] },
      }
    });

    db.prepare('INSERT INTO odontograms (patient_id, data) VALUES (?, ?)').run(patientId, odontogramData);

    const odontogram = db.prepare('SELECT * FROM odontograms WHERE patient_id = ?').get(patientId);
    const data = JSON.parse(odontogram.data);
    logTest('Guardar odontograma', data.teeth['17'].condition === 'caries');
  } catch (error) {
    logTest('Guardar odontograma', false, error);
  }

  // Test 4: Obtener historial del paciente
  try {
    const notes = db.prepare('SELECT * FROM clinical_notes WHERE patient_id = ? ORDER BY created_at DESC').all(patientId);
    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY date DESC').all(patientId);

    logTest('Obtener historial del paciente', notes.length > 0 && prescriptions.length > 0);
  } catch (error) {
    logTest('Obtener historial del paciente', false, error);
  }

  return { noteId, prescriptionId };
}

function testBilling(patientId) {
  console.log('\n--- FACTURACIÓN ---\n');

  const today = new Date().toISOString().split('T')[0];

  // Test 1: Obtener tratamientos
  try {
    const treatments = db.prepare('SELECT * FROM treatments WHERE active = 1').all();
    logTest('Obtener lista de tratamientos', treatments.length === 4);
  } catch (error) {
    logTest('Obtener lista de tratamientos', false, error);
  }

  // Test 2: Crear factura
  let invoiceId;
  try {
    const invoiceNumber = `FACT-${Date.now().toString().slice(-6)}`;

    const transaction = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount, tax_amount, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(patientId, invoiceNumber, today, 232, 32, 'issued');

      const invoiceId = info.lastInsertRowid;

      // Insertar items
      const stmtItem = db.prepare(`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmtItem.run(invoiceId, 'Limpieza Dental', 1, 100, 100);
      stmtItem.run(invoiceId, 'Composite', 1, 80, 80);

      return invoiceId;
    });

    invoiceId = transaction();
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    logTest('Crear factura', invoice && invoice.invoice_number.startsWith('FACT-'));
  } catch (error) {
    logTest('Crear factura', false, error);
  }

  // Test 3: Obtener detalles de factura
  try {
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    logTest('Obtener detalles de factura', items.length === 2 && subtotal === 180);
  } catch (error) {
    logTest('Obtener detalles de factura', false, error);
  }

  // Test 4: Actualizar estado de factura
  try {
    db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run('paid', invoiceId);
    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    logTest('Actualizar estado de factura a pagado', updated.status === 'paid');
  } catch (error) {
    logTest('Actualizar estado de factura a pagado', false, error);
  }

  // Test 5: Crear tratamiento personalizado
  try {
    const info = db.prepare(`
      INSERT INTO treatments (name, category, price, apply_tax)
      VALUES (?, ?, ?, ?)
    `).run('Tratamiento de Conducto', 'treatment', 500, 1);

    const treatment = db.prepare('SELECT * FROM treatments WHERE id = ?').get(info.lastInsertRowid);
    logTest('Crear tratamiento personalizado', treatment && treatment.name === 'Tratamiento de Conducto');
  } catch (error) {
    logTest('Crear tratamiento personalizado', false, error);
  }

  return invoiceId;
}

function testAuditLogs() {
  console.log('\n--- AUDITORÍA ---\n');

  // Test 1: Registrar acción de auditoría
  try {
    const info = db.prepare(`
      INSERT INTO audit_logs (user_id, action, module, details)
      VALUES (?, ?, ?, ?)
    `).run(1, 'LOGIN', 'AUTH', 'Inicio de sesión exitoso');

    const log = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(info.lastInsertRowid);
    logTest('Registrar acción de auditoría', log && log.action === 'LOGIN');
  } catch (error) {
    logTest('Registrar acción de auditoría', false, error);
  }

  // Test 2: Obtener logs de auditoría
  try {
    const logs = db.prepare(`
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `).all();

    logTest('Obtener logs de auditoría', logs.length > 0);
  } catch (error) {
    logTest('Obtener logs de auditoría', false, error);
  }
}

function testDataIntegrity() {
  console.log('\n--- INTEGRIDAD DE DATOS ---\n');

  // Test 1: Foreign keys activas
  try {
    let errorOccurred = false;
    try {
      // Intentar crear factura con paciente inexistente
      db.prepare(`
        INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount)
        VALUES (?, ?, ?, ?)
      `).run(9999, 'TEST-001', new Date().toISOString().split('T')[0], 100);
    } catch (e) {
      errorOccurred = true;
    }
    logTest('Foreign keys activas (rechaza FK inválida)', errorOccurred);
  } catch (error) {
    logTest('Foreign keys activas (rechaza FK inválida)', false, error);
  }

  // Test 2: Usuario único
  try {
    let errorOccurred = false;
    try {
      db.prepare(`INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)`)
        .run('admin', 'hash', 'Admin Duplicado');
    } catch (e) {
      errorOccurred = true;
    }
    logTest('Username único (rechaza duplicado)', errorOccurred);
  } catch (error) {
    logTest('Username único (rechaza duplicado)', false, error);
  }

  // Test 3: Tratamiento único
  try {
    let errorOccurred = false;
    try {
      db.prepare(`INSERT INTO treatments (name, category, price) VALUES (?, ?, ?)`)
        .run('Limpieza Dental', 'treatment', 150);
    } catch (e) {
      errorOccurred = true;
    }
    logTest('Nombre de tratamiento único (rechaza duplicado)', errorOccurred);
  } catch (error) {
    logTest('Nombre de tratamiento único (rechaza duplicado)', false, error);
  }

  // Test 4: Eliminación en cascada (simular con paciente)
  try {
    // Crear paciente para eliminar
    const info = db.prepare(`INSERT INTO patients (name, email, phone, birth_date, address) VALUES (?, ?, ?, ?, ?)`)
      .run('Paciente a Eliminar', 'delete@test.com', '555-0000', '2000-01-01', 'Test');

    const patientIdToDelete = info.lastInsertRowid;

    // Crear nota clínica relacionada
    db.prepare(`INSERT INTO clinical_notes (patient_id, content) VALUES (?, ?)`)
      .run(patientIdToDelete, 'Nota para eliminar');

    // Eliminar paciente (debe eliminar en cascada)
    db.prepare('DELETE FROM clinical_notes WHERE patient_id = ?').run(patientIdToDelete);
    db.prepare('DELETE FROM patients WHERE id = ?').run(patientIdToDelete);

    const deleted = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientIdToDelete);
    logTest('Eliminación correcta', !deleted);
  } catch (error) {
    logTest('Eliminación correcta', false, error);
  }
}

function cleanup() {
  try {
    if (db) db.close();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    console.log('\n=== CLEANUP COMPLETADO ===\n');
  } catch (error) {
    console.error('Error en cleanup:', error);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`Total de pruebas: ${testsPassed + testsFailed}`);
  console.log(`Pruebas exitosas: ${testsPassed} ✅`);
  console.log(`Pruebas fallidas: ${testsFailed} ❌`);
  console.log(`Porcentaje de éxito: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);
  console.log('='.repeat(60) + '\n');

  if (testsFailed > 0) {
    console.log('Pruebas fallidas:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error || 'Error desconocido'}`);
    });
  }
}

// ===== EJECUTAR PRUEBAS =====
console.log('\n' + '='.repeat(60));
console.log('LIADENT CRM - SUITE DE PRUEBAS FUNCIONALES');
console.log('='.repeat(60) + '\n');

if (setup()) {
  testAuthentication();
  const patientId = testPatientManagement();
  const appointmentId = testAppointments(patientId);
  testClinicalFeatures(patientId);
  testBilling(patientId);
  testAuditLogs();
  testDataIntegrity();

  cleanup();
  printSummary();

  process.exit(testsFailed > 0 ? 1 : 0);
} else {
  console.error('Error en setup. Pruebas abortadas.');
  process.exit(1);
}
