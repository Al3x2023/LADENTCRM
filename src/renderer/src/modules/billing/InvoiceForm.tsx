import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { X, User, FileText, DollarSign, Calendar, Zap } from 'lucide-react'
import { Patient, Treatment } from '../../env'
import { useToast } from '../../context/ToastContext'

interface InvoiceFormProps {
  onSave: (invoice: any) => void
  onCancel: () => void
}

export const InvoiceForm = ({ onSave, onCancel }: InvoiceFormProps) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, apply_tax: true }])
  const [showTreatmentList, setShowTreatmentList] = useState(false)
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    patient_id: 0,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    status: 'issued'
  })

  useEffect(() => {
    loadPatients()
    loadTreatments()
  }, [])

  const loadPatients = async () => {
    const data = await window.api.getPatients()
    setPatients(data)
  }

  const loadTreatments = async () => {
    const data = await window.api.getTreatments()
    setTreatments(data)
  }

  const addTreatmentToItems = (treatment: Treatment) => {
    setItems([...items, {
      description: treatment.name,
      quantity: 1,
      unitPrice: treatment.price,
      apply_tax: treatment.apply_tax ? true : false
    }])
    setShowTreatmentList(false)
    showToast(`${treatment.name} agregado`, 'success')
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTaxAmount = () => {
    return items.reduce((sum, item) => {
      const itemTax = item.apply_tax ? (item.quantity * item.unitPrice) * 0.16 : 0
      return sum + itemTax
    }, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patient_id || formData.patient_id === 0) {
      showToast('Selecciona un paciente', 'error')
      return
    }
    if (items.length === 0 || !items.some(i => i.description.trim())) {
      showToast('Agrega al menos un concepto', 'error')
      return
    }
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount()
    const total = subtotal + taxAmount
    const invoiceNumber = `FACT-${Date.now().toString().slice(-6)}`

    // Calculate total_price for each item
    const itemsWithTotals = items
      .filter(i => i.description.trim())
      .map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice
      }))

    onSave({
      invoice: {
        ...formData,
        patient_id: parseInt(formData.patient_id.toString()),
        invoice_number: invoiceNumber,
        total_amount: total,
        tax_amount: taxAmount,
        status: 'issued'
      },
      items: itemsWithTotals
    })
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, apply_tax: true }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const updateItemTax = (index: number, apply_tax: boolean) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], apply_tax }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-white z-10 border-b">
          <CardTitle className="text-xl">Crear Nueva Factura</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Paciente
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value={0}>Selecciona un paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id_number || 'Sin DNI'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Fecha de Emisión
                </label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Vencimiento</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Conceptos
                </h4>
                <div className="flex gap-2">
                  {treatments.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowTreatmentList(!showTreatmentList)}
                      className="gap-1"
                    >
                      <Zap className="w-3 h-3" /> Rapido
                    </Button>
                  )}
                  <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    + Agregar
                  </Button>
                </div>
              </div>

              {showTreatmentList && treatments.length > 0 && (
                <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-xs font-semibold text-teal-900 mb-2">Tratamientos Rapidos:</p>
                  <div className="flex flex-wrap gap-2">
                    {treatments.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => addTreatmentToItems(t)}
                        className="px-3 py-1 bg-white border border-teal-300 rounded-lg text-xs hover:bg-teal-100 transition-colors flex items-center gap-1"
                      >
                        <span>{t.name}</span>
                        <Badge className="bg-teal-600 text-white text-[9px] px-1">
                          ${t.price.toFixed(2)}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="space-y-2 p-3 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <Input
                          placeholder="Descripcion del servicio..."
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600 font-medium">Cantidad</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600 font-medium">Precio</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                          required
                        />
                      </div>
                      <div className="col-span-1 text-right font-semibold text-teal-600">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      <div className="col-span-2">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => removeItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-1">
                      <input
                        type="checkbox"
                        checked={item.apply_tax || false}
                        onChange={(e) => updateItemTax(index, e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <label className="text-xs text-slate-600 font-medium">Aplicar IVA (16%)</label>
                      {item.apply_tax && (
                        <span className="text-xs text-teal-600 font-semibold">
                          +${((item.quantity * item.unitPrice) * 0.16).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-end">
                  <div className="w-72 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">IVA (16%):</span>
                      <span className="font-semibold text-amber-600">${calculateTaxAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2 border-teal-200">
                      <span>Total:</span>
                      <span className="text-teal-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notas Adicionales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Notas internas..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 shadow-indigo-200 shadow-lg">
                <DollarSign className="w-4 h-4 mr-2" /> Generar Factura
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
