export const SCHEMA = `
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
