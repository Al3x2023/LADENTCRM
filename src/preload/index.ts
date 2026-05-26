import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Auth
  login: (username: string, password: string) => ipcRenderer.invoke('login', { username, password }),
  getUsers: () => ipcRenderer.invoke('get-users'),
  addUser: (data: any) => ipcRenderer.invoke('add-user', data),
  updateUser: (data: any) => ipcRenderer.invoke('update-user', data),
  changePassword: (data: any) => ipcRenderer.invoke('change-password', data),
  getAuditLogs: (params?: any) => ipcRenderer.invoke('get-audit-logs', params || {}),

  // Staff
  getStaff: () => ipcRenderer.invoke('get-staff'),
  addStaff: (data: any) => ipcRenderer.invoke('add-staff', data),
  updateStaff: (data: any) => ipcRenderer.invoke('update-staff', data),

  // Patients
  getPatients: () => ipcRenderer.invoke('get-patients'),
  addPatient: (patient) => ipcRenderer.invoke('add-patient', patient),
  updatePatient: (patient) => ipcRenderer.invoke('update-patient', patient),
  deletePatient: (id: number) => ipcRenderer.invoke('delete-patient', id),
  uploadPatientImage: (patientId, category) => ipcRenderer.invoke('upload-patient-image', { patientId, category }),
  getPatientImages: (patientId) => ipcRenderer.invoke('get-patient-images', patientId),
  getImageUrl: (fileName) => ipcRenderer.invoke('get-image-url', fileName),
  deletePatientImage: (id, fileName) => ipcRenderer.invoke('delete-patient-image', { id, fileName }),

  // Appointments
  getAppointments: () => ipcRenderer.invoke('get-appointments'),
  addAppointment: (appointment) => ipcRenderer.invoke('add-appointment', appointment),
  updateAppointmentStatus: (id: number, status: string) => ipcRenderer.invoke('update-appointment-status', id, status),
  updateAppointmentPayment: (id, paid) => ipcRenderer.invoke('update-appointment-payment', { id, paid }),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),

  // Clinical
  getOdontogram: (patientId) => ipcRenderer.invoke('get-odontogram', patientId),
  saveOdontogram: (patientId, data) => ipcRenderer.invoke('save-odontogram', { patientId, data }),
  getClinicalNotes: (patientId) => ipcRenderer.invoke('get-clinical-notes', patientId),
  addClinicalNote: (note) => ipcRenderer.invoke('add-clinical-note', note),
  getPrescriptions: (patientId) => ipcRenderer.invoke('get-prescriptions', patientId),
  addPrescription: (prescription) => ipcRenderer.invoke('add-prescription', prescription),

  // Billing
  getInvoices: (patientId?: number) => ipcRenderer.invoke('get-invoices', patientId),
  createInvoice: (data) => ipcRenderer.invoke('create-invoice', data),
  getInvoiceDetails: (invoiceId) => ipcRenderer.invoke('get-invoice-details', invoiceId),
  updateInvoiceStatus: (data) => ipcRenderer.invoke('update-invoice-status', data),

  // Treatments & Products
  getTreatments: () => ipcRenderer.invoke('get-treatments'),
  addTreatment: (data: any) => ipcRenderer.invoke('add-treatment', data),
  updateTreatment: (data: any) => ipcRenderer.invoke('update-treatment', data),
  deleteTreatment: (id: number) => ipcRenderer.invoke('delete-treatment', id),

  // User Management
  deleteUser: (id: number) => ipcRenderer.invoke('delete-user', id),
  resetUserPassword: (data: any) => ipcRenderer.invoke('reset-user-password', data),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts)
  window.api = api
}
