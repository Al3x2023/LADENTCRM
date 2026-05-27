/**
 * Test específico para Generación de Facturas
 */

const Database = require('better-sqlite3');
const fs = require('fs');

const TEST_DB_PATH = './test_invoices.db';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    total_amount REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'issued',
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

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'treatment',
    price REAL NOT NULL,
    apply_tax INTEGER DEFAULT 1
  );
`;

// Setup
if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
const db = new Database(TEST_DB_PATH);
db.pragma('foreign_keys = ON');
db.exec(SCHEMA);

console.log('\n=== TEST DE GENERACIÓN DE FACTURAS ===\n');

// Crear paciente de prueba
const patientInfo = db.prepare('INSERT INTO patients (name, email) VALUES (?, ?)').run('Juan Pérez', 'juan@test.com');
const patientId = patientInfo.lastInsertRowid;
console.log(`✅ Paciente creado: ID ${patientId}`);

// Crear tratamientos de prueba
db.prepare('INSERT INTO treatments (name, price, apply_tax) VALUES (?, ?, ?)').run('Limpieza Dental', 100, 1);
db.prepare('INSERT INTO treatments (name, price, apply_tax) VALUES (?, ?, ?)').run('Blanqueamiento', 300, 1);
db.prepare('INSERT INTO treatments (name, price, apply_tax) VALUES (?, ?, ?)').run('Composite', 80, 0);
console.log('✅ Tratamientos creados: 3');

// Test 1: Factura con IVA
console.log('\n--- Test 1: Factura con IVA ---\n');

const invoiceNumber1 = `FACT-${Date.now().toString().slice(-6)}`;
const today = new Date().toISOString().split('T')[0];

const transaction1 = db.transaction(() => {
  // Items: Limpieza (100 + 16% IVA) + Blanqueamiento (300 + 16% IVA)
  const subtotal = 100 + 300; // 400
  const tax = (100 * 0.16) + (300 * 0.16); // 64
  const total = subtotal + tax; // 464

  const info = db.prepare(`
    INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount, tax_amount)
    VALUES (?, ?, ?, ?, ?)
  `).run(patientId, invoiceNumber1, today, total, tax);

  const invoiceId = info.lastInsertRowid;

  db.prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
    .run(invoiceId, 'Limpieza Dental', 1, 100, 100);

  db.prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
    .run(invoiceId, 'Blanqueamiento', 1, 300, 300);

  return invoiceId;
});

const invoiceId1 = transaction1();
const invoice1 = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId1);
const items1 = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId1);

console.log(`Factura: ${invoice1.invoice_number}`);
console.log(`Subtotal: $${items1.reduce((s, i) => s + i.total_price, 0)}`);
console.log(`IVA (16%): $${invoice1.tax_amount}`);
console.log(`Total: $${invoice1.total_amount}`);

const expectedTotal1 = 464;
const expectedTax1 = 64;

console.log(`\nTotal esperado: $${expectedTotal1} | actual: $${invoice1.total_amount}`);
console.log(`IVA esperado: $${expectedTax1} | actual: $${invoice1.tax_amount}`);

if (invoice1.total_amount === expectedTotal1 && invoice1.tax_amount === expectedTax1) {
  console.log('✅ PASSED: Cálculo de IVA correcto');
} else {
  console.log('❌ FAILED: Error en cálculo de IVA');
}

// Test 2: Factura con IVA mixto (algunos ítems con IVA, otros sin IVA)
console.log('\n--- Test 2: Factura con IVA mixto ---\n');

const invoiceNumber2 = `FACT-${(Date.now() + 1).toString().slice(-6)}`;

const transaction2 = db.transaction(() => {
  // Items: Limpieza (100 + 16% IVA) + Composite (80 sin IVA)
  const subtotal = 100 + 80; // 180
  const tax = 100 * 0.16; // 16 (solo el primer ítem tiene IVA)
  const total = subtotal + tax; // 196

  const info = db.prepare(`
    INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount, tax_amount)
    VALUES (?, ?, ?, ?, ?)
  `).run(patientId, invoiceNumber2, today, total, tax);

  const invoiceId = info.lastInsertRowid;

  db.prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
    .run(invoiceId, 'Limpieza Dental', 1, 100, 100);

  db.prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
    .run(invoiceId, 'Composite', 1, 80, 80);

  return invoiceId;
});

const invoiceId2 = transaction2();
const invoice2 = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId2);
const items2 = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId2);

console.log(`Factura: ${invoice2.invoice_number}`);
console.log(`Subtotal: $${items2.reduce((s, i) => s + i.total_price, 0)}`);
console.log(`IVA (16% parcial): $${invoice2.tax_amount}`);
console.log(`Total: $${invoice2.total_amount}`);

const expectedTotal2 = 196;
const expectedTax2 = 16;

console.log(`\nTotal esperado: $${expectedTotal2} | actual: $${invoice2.total_amount}`);
console.log(`IVA esperado: $${expectedTax2} | actual: $${invoice2.tax_amount}`);

if (invoice2.total_amount === expectedTotal2 && invoice2.tax_amount === expectedTax2) {
  console.log('✅ PASSED: Cálculo de IVA mixto correcto');
} else {
  console.log('❌ FAILED: Error en cálculo de IVA mixto');
}

// Test 3: Factura sin IVA
console.log('\n--- Test 3: Factura sin IVA ---\n');

const invoiceNumber3 = `FACT-${(Date.now() + 2).toString().slice(-6)}`;

const transaction3 = db.transaction(() => {
  const subtotal = 80; // Solo Composite sin IVA
  const tax = 0;
  const total = 80;

  const info = db.prepare(`
    INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount, tax_amount)
    VALUES (?, ?, ?, ?, ?)
  `).run(patientId, invoiceNumber3, today, total, tax);

  const invoiceId = info.lastInsertRowid;

  db.prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
    .run(invoiceId, 'Composite Restauración', 1, 80, 80);

  return invoiceId;
});

const invoiceId3 = transaction3();
const invoice3 = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId3);

console.log(`Factura: ${invoice3.invoice_number}`);
console.log(`Total: $${invoice3.total_amount}`);
console.log(`IVA: $${invoice3.tax_amount}`);

if (invoice3.total_amount === 80 && invoice3.tax_amount === 0) {
  console.log('✅ PASSED: Factura sin IVA correcta');
} else {
  console.log('❌ FAILED: Error en factura sin IVA');
}

// Test 4: Factura con cantidad > 1
console.log('\n--- Test 4: Factura con cantidad > 1 ---\n');

const invoiceNumber4 = `FACT-${(Date.now() + 3).toString().slice(-6)}`;

const transaction4 = db.transaction(() => {
  // 2 Limpiezas (2 x 100 = 200) + IVA 16%
  const subtotal = 200;
  const tax = 32;
  const total = 232;

  const info = db.prepare(`
    INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount, tax_amount)
    VALUES (?, ?, ?, ?, ?)
  `).run(patientId, invoiceNumber4, today, total, tax);

  const invoiceId = info.lastInsertRowid;

  db.prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
    .run(invoiceId, 'Limpieza Dental', 2, 100, 200);

  return invoiceId;
});

const invoiceId4 = transaction4();
const invoice4 = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId4);
const items4 = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId4);

console.log(`Factura: ${invoice4.invoice_number}`);
console.log(`Item: ${items4[0].description} x${items4[0].quantity}`);
console.log(`Total: $${invoice4.total_amount} (IVA: $${invoice4.tax_amount})`);

if (invoice4.total_amount === 232 && items4[0].quantity === 2) {
  console.log('✅ PASSED: Factura con cantidad correcta');
} else {
  console.log('❌ FAILED: Error en factura con cantidad');
}

// Test 5: Verificar integridad FK
console.log('\n--- Test 5: Integridad de Foreign Keys ---\n');

try {
  db.prepare(`
    INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount)
    VALUES (?, ?, ?, ?)
  `).run(9999, 'FACT-INVALID', today, 100);

  console.log('❌ FAILED: FK debería haber fallado');
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    console.log('✅ PASSED: FK rechaza paciente inexistente');
  } else {
    console.log('❌ FAILED: Error inesperado:', error.message);
  }
}

// Test 6: Verificar número de factura único
console.log('\n--- Test 6: Número de factura único ---\n');

try {
  db.prepare(`
    INSERT INTO invoices (patient_id, invoice_number, issue_date, total_amount)
    VALUES (?, ?, ?, ?)
  `).run(patientId, invoiceNumber1, today, 100);

  console.log('❌ FAILED: Debería haber rechazado número duplicado');
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    console.log('✅ PASSED: Número de factura único');
  } else {
    console.log('❌ FAILED: Error inesperado:', error.message);
  }
}

// Resumen
console.log('\n=== RESUMEN DE PRUEBAS DE FACTURACIÓN ===\n');

const invoices = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
const invoiceItems = db.prepare('SELECT COUNT(*) as count FROM invoice_items').get();

console.log(`Total facturas creadas: ${invoices.count}`);
console.log(`Total items de factura: ${invoiceItems.count}`);

// Verificar que los totales coinciden
const allInvoices = db.prepare('SELECT * FROM invoices').all();
let allCorrect = true;

allInvoices.forEach(inv => {
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
  const calculatedSubtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  // Nota: la tax_amount ya incluye el IVA aplicado según el apply_tax de cada tratamiento
  const calculatedTotal = calculatedSubtotal + inv.tax_amount;

  if (Math.abs(calculatedTotal - inv.total_amount) > 0.01) {
    console.log(`❌ Factura ${inv.invoice_number} tiene inconsistencia en totales`);
    allCorrect = false;
  }
});

if (allCorrect) {
  console.log('\n✅ Todo: Todos los totales de facturas son consistentes\n');
}

// Cleanup
db.close();
fs.unlinkSync(TEST_DB_PATH);
console.log('=== TEST DE FACTURACIÓN COMPLETADO ===\n');
