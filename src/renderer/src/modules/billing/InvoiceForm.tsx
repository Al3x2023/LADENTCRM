import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { X, User, FileText, DollarSign, Calendar } from 'lucide-react'
import { Patient } from '../../env'

interface InvoiceFormProps {
  onSave: (invoice: any) => void
  onCancel: () => void
}

export const InvoiceForm = ({ onSave, onCancel }: InvoiceFormProps) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }])
  const [formData, setFormData] = useState({
    patient_id: 0,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    status: 'issued'
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    const data = await window.api.getPatients()
    setPatients(data)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = calculateTotal()
    const invoiceNumber = `FACT-${Date.now().toString().slice(-6)}`
    onSave({
      ...formData,
      patient_id: parseInt(formData.patient_id.toString()),
      invoice_number: invoiceNumber,
      total_amount: total,
      tax_amount: total * 0.16,
      items
    })
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
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
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  + Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <Input
                        placeholder="Descripción del servicio..."
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-1 text-right font-semibold">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                    <div className="col-span-1">
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
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (16%):</span>
                      <span>${(calculateTotal() * 0.16).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2">
                      <span>Total:</span>
                      <span className="text-indigo-600">${(calculateTotal() * 1.16).toFixed(2)}</span>
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
