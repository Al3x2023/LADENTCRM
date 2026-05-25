import { jsPDF } from "jspdf"
import { Patient, Invoice, Prescription } from '../env'

export function generatePrescriptionPDF(prescription: Prescription, patient: Patient): void {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('RECETA MÉDICA', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Clínica Dental LIADENT', 105, 28, { align: 'center' })
  doc.text('Consultorio Profesional', 105, 34, { align: 'center' })
  
  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 40, 190, 40)
  
  // Patient info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Paciente:', 20, 50)
  doc.setFont('helvetica', 'normal')
  doc.text(patient.name, 50, 50)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Fecha:', 20, 58)
  doc.setFont('helvetica', 'normal')
  doc.text(prescription.date || new Date().toLocaleDateString(), 50, 58)
  
  if (patient.id_number && patient.id_number.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('DNI/ID:', 20, 66)
    doc.setFont('helvetica', 'normal')
    doc.text(patient.id_number, 50, 66)
  }
  
  // Medications
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Medicamentos:', 20, 85)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const medsLines = doc.splitTextToSize(prescription.medications, 170)
  doc.text(medsLines, 20, 95)
  
  const medsHeight = medsLines.length * 6
  let nextY = 95 + medsHeight + 10
  
  // Instructions
  if (prescription.instructions) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Instrucciones:', 20, nextY)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const instLines = doc.splitTextToSize(prescription.instructions, 170)
    doc.text(instLines, 20, nextY + 8)
    nextY = nextY + instLines.length * 5 + 15
  }
  
  // Doctor signature area
  doc.setLineWidth(0.5)
  doc.line(80, 250, 130, 250)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Dr. Alejandro', 105, 258, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.text('Médico Cirujano Dentista', 105, 264, { align: 'center' })
  
  doc.save(`RECETA_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function generateInvoicePDF(invoice: Invoice, patientName: string): void {
  const doc = new jsPDF()
  
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', 105, 25, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text('Clínica Dental LIADENT', 105, 32, { align: 'center' })
  
  // Invoice details
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Factura #: ${invoice.invoice_number}`, 140, 20)
  doc.text(`Fecha: ${new Date(invoice.issue_date).toLocaleDateString()}`, 140, 28)
  
  doc.line(20, 45, 190, 45)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Paciente:', 20, 55)
  doc.setFont('helvetica', 'normal')
  doc.text(patientName, 50, 55)
  
  // Total
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total: $${invoice.total_amount.toFixed(2)}`, 140, 70)
  
  doc.save(`FACTURA_${invoice.invoice_number}.pdf`)
}
