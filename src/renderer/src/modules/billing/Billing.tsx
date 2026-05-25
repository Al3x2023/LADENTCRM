import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { CreditCard, Plus, Search, FileText, Download, DollarSign, TrendingUp, FileSpreadsheet, X } from 'lucide-react'
import { Invoice, Patient } from '../../env'
import { useToast } from '../../context/ToastContext'
import { exportToCSV } from '../../utils/export'
import { generateInvoicePDF } from '../../utils/pdf'
import { InvoiceForm } from './InvoiceForm'

export const Billing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState<{ invoice: Invoice } | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const invoicesData = await window.api.getInvoices()
    const patientsData = await window.api.getPatients()
    setInvoices(invoicesData)
    setPatients(patientsData)
  }

  const getPatientName = (patientId: number | undefined) => {
    if (!patientId) return 'Paciente Desconocido'
    const patient = patients.find(p => p.id === patientId)
    return patient?.name || 'Paciente Desconocido'
  }

  const calculateStats = () => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const monthlyInvoices = invoices.filter(inv => {
      const d = new Date(inv.issue_date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })

    const totalIncome = monthlyInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total_amount : 0), 0)
    const pendingCount = invoices.filter(inv => inv.status === 'issued' || inv.status === 'partially_paid').length
    const pendingTotal = invoices.filter(inv => inv.status === 'issued' || inv.status === 'partially_paid').reduce((sum, inv) => sum + inv.total_amount, 0)
    const paidCount = invoices.filter(inv => inv.status === 'paid').length
    const totalCount = invoices.filter(inv => inv.status !== 'cancelled').length
    const collectionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0

    return { totalIncome, pendingCount, pendingTotal, collectionRate }
  }

  const stats = calculateStats()

  const handleDownloadInvoice = (inv: Invoice) => {
    showToast(`Generando PDF para la factura ${inv.invoice_number}...`, 'info')
    const patientName = getPatientName(inv.patient_id!)
    setTimeout(() => {
      generateInvoicePDF(inv, patientName)
      showToast('Documento fiscal generado y guardado en Descargas', 'success')
    }, 500)
  }

  const handleExportCSV = () => {
    exportToCSV(
      invoices.map(inv => ({
        ...inv,
        patient_name: getPatientName(inv.patient_id!)
      })),
      'Facturas_LIADENT',
      {
        invoice_number: 'Factura',
        patient_name: 'Paciente',
        issue_date: 'Fecha',
        total_amount: 'Total',
        status: 'Estado'
      }
    )
    showToast('Exportación a CSV completada', 'success')
  }

  const handleSaveInvoice = async (invoice: any) => {
    try {
      await window.api.createInvoice(invoice)
      showToast('Factura generada correctamente', 'success')
      setShowForm(false)
      fetchData()
    } catch (error) {
      showToast('Error al generar la factura', 'error')
      console.error(error)
    }
  }

  const handleStatusChange = async (invoice: Invoice, newStatus: string) => {
    try {
      await window.api.updateInvoiceStatus({ id: invoice.id!, status: newStatus })
      showToast(`Estado de factura actualizado a "${newStatus}"`, 'success')
      setShowStatusModal(null)
      fetchData()
    } catch (error) {
      showToast('Error al actualizar el estado', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Pagado</Badge>
      case 'partially_paid': return <Badge variant="warning">Parcial</Badge>
      case 'issued': return <Badge variant="default">Emitido</Badge>
      case 'cancelled': return <Badge variant="danger">Cancelado</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600" /> Facturación y Cobros
          </h2>
          <p className="text-slate-500 mt-1">Gestiona facturas, pagos y reportes financieros.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-indigo-100" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Nueva Factura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none shadow-indigo-200 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-indigo-100 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Ingresos este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">${stats.totalIncome.toFixed(2)}</div>
            <p className="text-indigo-200 text-xs mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Datos reales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" /> Facturas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.pendingCount}</div>
            <p className="text-amber-600 text-xs mt-2 font-bold">Total pendiente: ${stats.pendingTotal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Tasa de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.collectionRate}%</div>
            <p className="text-emerald-600 text-xs mt-2 font-bold">Datos actualizados</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-10 bg-white" 
              placeholder="Buscar por factura o paciente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
              <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-bold text-slate-900">{inv.invoice_number}</TableCell>
                  <TableCell>{getPatientName(inv.patient_id!)}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(inv.issue_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-black text-slate-900">${inv.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => setShowStatusModal({ invoice: inv })}
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadInvoice(inv)}
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 mb-2 opacity-20" />
                    <p>No se encontraron facturas emitidas.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showForm && (
        <InvoiceForm 
          onSave={handleSaveInvoice} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Cambiar Estado de Factura</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowStatusModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Factura: <strong>{showStatusModal.invoice.invoice_number}</strong><br />
                Paciente: <strong>{getPatientName(showStatusModal.invoice.patient_id!)}</strong><br />
                Total: <strong>${showStatusModal.invoice.total_amount.toFixed(2)}</strong>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-slate-600 hover:bg-slate-700"
                  onClick={() => handleStatusChange(showStatusModal.invoice, 'draft')}
                >
                  Borrador
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => handleStatusChange(showStatusModal.invoice, 'issued')}
                >
                  Emitido
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleStatusChange(showStatusModal.invoice, 'paid')}
                >
                  Pagado
                </Button>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleStatusChange(showStatusModal.invoice, 'partially_paid')}
                >
                  Parcial
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 col-span-2"
                  onClick={() => handleStatusChange(showStatusModal.invoice, 'cancelled')}
                >
                  Cancelado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
