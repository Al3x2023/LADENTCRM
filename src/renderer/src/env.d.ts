export interface Patient {
  id?: number;
  name: string;
  id_number?: string;
  email: string;
  phone: string;
  birth_date: string;
  address: string;
  gender?: string;
  blood_type?: string;
  allergies?: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id?: number;
  patient_id?: number;
  patient_name?: string;
  doctor_id?: number;
  date: string;
  time: string;
  duration?: number;
  reason: string;
  status: string;
  cost?: number;
  paid?: number;
}

export interface ClinicalNote {
  id?: number;
  patient_id: number;
  doctor_id?: number;
  doctor_name?: string;
  appointment_id?: number;
  content: string;
  vitals_signs?: string;
  created_at?: string;
}

export interface Prescription {
  id?: number;
  patient_id: number;
  doctor_id?: number;
  doctor_name?: string;
  date?: string;
  medications: string;
  instructions?: string;
  expires_at?: string;
}

export interface Invoice {
  id?: number;
  patient_id?: number;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  total_amount: number;
  tax_amount?: number;
  status: string;
  notes?: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CustomAPI {
  // Patients
  getPatients: () => Promise<Patient[]>;
  addPatient: (patient: Patient) => Promise<number>;
  updatePatient: (patient: Patient) => Promise<number>;
  uploadPatientImage: (patientId: number, category: string) => Promise<{ success: boolean, fileName: string }>;
  getPatientImages: (patientId: number) => Promise<any[]>;
  getImageUrl: (fileName: string) => Promise<string | null>;
  deletePatientImage: (id: number, fileName: string) => Promise<void>;

  // Appointments
  getAppointments: () => Promise<Appointment[]>;
  addAppointment: (appointment: Appointment) => Promise<number>;
  updateAppointmentStatus: (id: number, status: string) => Promise<void>;
  updateAppointmentPayment: (id: number, paid: number) => Promise<void>;
  getDashboardStats: () => Promise<{ totalPatients: number, todayAppointments: number, nextAppointmentTime: string }>;

  // Clinical
  getOdontogram: (patientId: number) => Promise<{ data: string }>;
  saveOdontogram: (patientId: number, data: string) => Promise<void>;
  getClinicalNotes: (patientId: number) => Promise<ClinicalNote[]>;
  addClinicalNote: (note: ClinicalNote) => Promise<number>;
  getPrescriptions: (patientId: number) => Promise<Prescription[]>;
  addPrescription: (prescription: Prescription) => Promise<number>;

  // Billing
  getInvoices: (patientId?: number) => Promise<Invoice[]>;
  createInvoice: (data: { invoice: Partial<Invoice>, items: Partial<InvoiceItem>[] }) => Promise<number>;
  getInvoiceDetails: (invoiceId: number) => Promise<{ invoice: Invoice, items: InvoiceItem[] }>;
  updateInvoiceStatus: (data: { id: number, status: string }) => Promise<void>;
}

declare global {
  interface Window {
    electron: any;
    api: CustomAPI;
  }
}
