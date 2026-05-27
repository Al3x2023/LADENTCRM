/**
 * Test específico para Dashboard y Estadísticas
 */

const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');

const TEST_DB_PATH = './test_dashboard.db';
const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync('liadent-secret-key-2026', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );
`;

// Setup
if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
const db = new Database(TEST_DB_PATH);
db.exec(SCHEMA);

// Crear pacientes de prueba
const patientIds = [];
for (let i = 1; i <= 10; i++) {
  const info = db.prepare('INSERT INTO patients (name, email, phone) VALUES (?, ?, ?)')
    .run(`Paciente ${i}`, `patient${i}@email.com`, `555-${i}${i}${i}`);
  patientIds.push(info.lastInsertRowid);
}

console.log(`✅ Creados ${patientIds.length} pacientes`);

// Crear citas de hoy
const today = new Date().toISOString().split('T')[0];
const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
times.forEach((time, idx) => {
  const patientId = patientIds[idx];
  const status = idx % 3 === 0 ? 'completed' : 'pending';
  db.prepare('INSERT INTO appointments (patient_id, date, time, status) VALUES (?, ?, ?, ?)')
    .run(patientId, today, time, status);
});

console.log(`✅ Creadas ${times.length} citas para hoy`);

// Test: getDashboardStats
console.log('\n--- TEST DASHBOARD STATS ---\n');

const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get();
console.log(`Total pacientes: ${totalPatients.count}`);
console.log(totalPatients.count === 10 ? '✅ PASSED' : '❌ FAILED');

const todayAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(today);
console.log(`\nCitas hoy: ${todayAppointments.count}`);
console.log(todayAppointments.count === 6 ? '✅ PASSED' : '❌ FAILED');

const nextAppointment = db.prepare(`
  SELECT time FROM appointments
  WHERE date = ? AND time >= strftime('%H:%M', 'now', 'localtime')
  AND status NOT IN ('cancelled', 'completed')
  ORDER BY time LIMIT 1
`).get(today);

console.log(`\nPróxima cita: ${nextAppointment ? nextAppointment.time : 'No hay más hoy'}`);
console.log(nextAppointment ? '✅ PASSED' : '⚠️ No hay próximas citas pendientes');

// Crear citas pasadas y futuras
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

db.prepare('INSERT INTO appointments (patient_id, date, time, status) VALUES (?, ?, ?, ?)')
  .run(patientIds[0], yesterday, '10:00', 'completed');

db.prepare('INSERT INTO appointments (patient_id, date, time, status) VALUES (?, ?, ?, ?)')
  .run(patientIds[1], tomorrow, '11:00', 'pending');

console.log('\n--- VERIFICACIÓN DE FECHAS ---\n');

const yesterdayAppts = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(yesterday);
console.log(`Citas ayer: ${yesterdayAppts.count}`);

const tomorrowAppts = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(tomorrow);
console.log(`Citas mañana: ${tomorrowAppts.count}`);

console.log(yesterdayAppts.count === 1 && tomorrowAppts.count === 1 ? '✅ PASSED' : '❌ FAILED');

// Cleanup
db.close();
fs.unlinkSync(TEST_DB_PATH);
console.log('\n✅ Test de Dashboard completado exitosamente\n');
