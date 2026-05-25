"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  // Patients
  getPatients: () => electron.ipcRenderer.invoke("get-patients"),
  addPatient: (patient) => electron.ipcRenderer.invoke("add-patient", patient),
  updatePatient: (patient) => electron.ipcRenderer.invoke("update-patient", patient),
  uploadPatientImage: (patientId, category) => electron.ipcRenderer.invoke("upload-patient-image", { patientId, category }),
  getPatientImages: (patientId) => electron.ipcRenderer.invoke("get-patient-images", patientId),
  getImageUrl: (fileName) => electron.ipcRenderer.invoke("get-image-url", fileName),
  deletePatientImage: (id, fileName) => electron.ipcRenderer.invoke("delete-patient-image", { id, fileName }),
  // Appointments
  getAppointments: () => electron.ipcRenderer.invoke("get-appointments"),
  addAppointment: (appointment) => electron.ipcRenderer.invoke("add-appointment", appointment),
  updateAppointmentStatus: (id, status) => electron.ipcRenderer.invoke("update-appointment-status", id, status),
  updateAppointmentPayment: (id, paid) => electron.ipcRenderer.invoke("update-appointment-payment", { id, paid }),
  getDashboardStats: () => electron.ipcRenderer.invoke("get-dashboard-stats"),
  // Clinical
  getOdontogram: (patientId) => electron.ipcRenderer.invoke("get-odontogram", patientId),
  saveOdontogram: (patientId, data) => electron.ipcRenderer.invoke("save-odontogram", { patientId, data }),
  getClinicalNotes: (patientId) => electron.ipcRenderer.invoke("get-clinical-notes", patientId),
  addClinicalNote: (note) => electron.ipcRenderer.invoke("add-clinical-note", note),
  getPrescriptions: (patientId) => electron.ipcRenderer.invoke("get-prescriptions", patientId),
  addPrescription: (prescription) => electron.ipcRenderer.invoke("add-prescription", prescription),
  // Billing
  getInvoices: (patientId) => electron.ipcRenderer.invoke("get-invoices", patientId),
  createInvoice: (data) => electron.ipcRenderer.invoke("create-invoice", data),
  getInvoiceDetails: (invoiceId) => electron.ipcRenderer.invoke("get-invoice-details", invoiceId),
  updateInvoiceStatus: (data) => electron.ipcRenderer.invoke("update-invoice-status", data)
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
