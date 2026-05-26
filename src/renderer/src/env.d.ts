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
  medical_history_summary?: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id?: number;
  patient_id?: number;
  patient_name?: string;
  phone?: string;
  doctor_id?: number;
  doctor_specialty?: string;
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
  patient_name?: string;
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

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  email?: string;
  active?: number;
  last_login?: string;
  created_at?: string;
}

export interface StaffMember {
  id: number;
  user_id: number;
  specialty?: string;
  license_number?: string;
  phone?: string;
  active?: number;
  username?: string;
  full_name?: string;
  role?: string;
  email?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  module: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  username?: string;
  user_name?: string;
}

export interface Treatment {
  id?: number;
  name: string;
  description?: string;
  category: 'treatment' | 'material' | 'service' | 'other';
  price: number;
  apply_tax?: number | boolean;
  active?: number | boolean;
  created_at?: string;
}

interface CustomAPI {
  // Auth
  login: (username: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  getUsers: () => Promise<User[]>;
  addUser: (data: { username: string; password: string; full_name: string; role: string; email?: string }) => Promise<{ success: boolean; id?: number; error?: string }>;
  updateUser: (data: { id: number; full_name: string; role: string; email?: string; active: boolean }) => Promise<{ success: boolean }>;
  changePassword: (data: { id: number; currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  getAuditLogs: (params?: { limit?: number; offset?: number }) => Promise<{ logs: AuditLog[]; total: number }>;

  // Staff
  getStaff: () => Promise<StaffMember[]>;
  addStaff: (data: { userId: number; specialty?: string; licenseNumber?: string; phone?: string }) => Promise<{ success: boolean; id?: number }>;
  updateStaff: (data: { id: number; specialty?: string; licenseNumber?: string; phone?: string; active: boolean }) => Promise<{ success: boolean }>;

  // Patients
  getPatients: () => Promise<Patient[]>;
  addPatient: (patient: Patient) => Promise<number>;
  updatePatient: (patient: Patient) => Promise<number>;
  deletePatient: (id: number) => Promise<number>;
  uploadPatientImage: (patientId: number, category: string) => Promise<{ success: boolean; fileName?: string }>;
  getPatientImages: (patientId: number) => Promise<any[]>;
  getImageUrl: (fileName: string) => Promise<string | null>;
  deletePatientImage: (id: number, fileName: string) => Promise<void>;

  // Appointments
  getAppointments: () => Promise<Appointment[]>;
  addAppointment: (appointment: Appointment) => Promise<number>;
  updateAppointmentStatus: (id: number, status: string) => Promise<void>;
  updateAppointmentPayment: (id: number, paid: number) => Promise<void>;
  getDashboardStats: () => Promise<{ totalPatients: number; todayAppointments: number; nextAppointmentTime: string }>;

  // Clinical
  getOdontogram: (patientId: number) => Promise<{ data: string }>;
  saveOdontogram: (patientId: number, data: string) => Promise<void>;
  getClinicalNotes: (patientId: number) => Promise<ClinicalNote[]>;
  addClinicalNote: (note: ClinicalNote) => Promise<number>;
  getPrescriptions: (patientId: number) => Promise<Prescription[]>;
  addPrescription: (prescription: Prescription) => Promise<number>;

  // Billing
  getInvoices: (patientId?: number) => Promise<Invoice[]>;
  createInvoice: (data: { invoice: Partial<Invoice>; items: Partial<InvoiceItem>[] }) => Promise<number>;
  getInvoiceDetails: (invoiceId: number) => Promise<{ invoice: Invoice; items: InvoiceItem[] }>;
  updateInvoiceStatus: (data: { id: number; status: string }) => Promise<void>;

  // Treatments & Products
  getTreatments: () => Promise<Treatment[]>;
  addTreatment: (data: { name: string; description?: string; category: string; price: number; apply_tax: boolean }) => Promise<{ success: boolean; id?: number; error?: string }>;
  updateTreatment: (data: { id: number; name: string; description?: string; price: number; apply_tax: boolean; active: boolean }) => Promise<{ success: boolean }>;
  deleteTreatment: (id: number) => Promise<number>;

  // User Management
  deleteUser: (id: number) => Promise<{ success: boolean; changes?: number; error?: string }>;
  resetUserPassword: (data: { id: number; newPassword: string }) => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electron: any;
    api: CustomAPI;
  }
}
