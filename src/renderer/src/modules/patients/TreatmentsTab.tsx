import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { Plus, CreditCard as Edit, Trash2, Copy } from 'lucide-react'
import { Treatment } from '../../env'
import { useToast } from '../../context/ToastContext'

interface TreatmentsTabProps {
  onSelectTreatment?: (treatment: Treatment) => void
}

export const TreatmentsTab = ({ onSelectTreatment }: TreatmentsTabProps) => {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Partial<Treatment>>({
    name: '',
    description: '',
    category: 'treatment',
    price: 0,
    apply_tax: true,
  })
  const { showToast } = useToast()

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    const data = await window.api.getTreatments()
    setTreatments(data)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      showToast('Nombre y precio son obligatorios', 'error')
      return
    }

    if (editingId) {
      const result = await window.api.updateTreatment({ id: editingId, name: formData.name || '', description: formData.description || '', price: formData.price || 0, apply_tax: formData.apply_tax as boolean, active: true })
      if (result.success) {
        showToast('Tratamiento actualizado', 'success')
      }
    } else {
      const result = await window.api.addTreatment(formData as any)
      if (result.success) {
        showToast('Tratamiento creado', 'success')
      }
    }
    setFormData({ name: '', description: '', category: 'treatment', price: 0, apply_tax: true })
    setEditingId(null)
    setShowForm(false)
    fetchTreatments()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Estas seguro de eliminar este tratamiento?')) {
      await window.api.deleteTreatment(id)
      showToast('Tratamiento eliminado', 'success')
      fetchTreatments()
    }
  }

  const handleEdit = (treatment: Treatment) => {
    setFormData({
      name: treatment.name || '',
      description: treatment.description || '',
      category: treatment.category,
      price: treatment.price,
      apply_tax: treatment.apply_tax ? true : false
    })
    setEditingId(treatment.id || null)
    setShowForm(true)
  }

  const filteredTreatments = treatments.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories: Record<string, string> = {
    treatment: 'Tratamiento',
    material: 'Material',
    service: 'Servicio',
    other: 'Otro'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Buscar tratamientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', category: 'treatment', price: 0, apply_tax: true }); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo Tratamiento
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>IVA</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTreatments.length > 0 ? filteredTreatments.map(treatment => (
              <TableRow key={treatment.id}>
                <TableCell className="font-medium">{treatment.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{categories[treatment.category]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{treatment.description || '-'}</TableCell>
                <TableCell className="text-right font-semibold text-teal-600">
                  ${treatment.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={treatment.apply_tax ? 'success' : 'secondary'}>
                    {treatment.apply_tax ? 'Si' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onSelectTreatment && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectTreatment(treatment)}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(treatment)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleDelete(treatment.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No hay tratamientos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Descripcion"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoria</label>
            <select
              value={formData.category || 'treatment'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm"
            >
              <option value="treatment">Tratamiento</option>
              <option value="material">Material</option>
              <option value="service">Servicio</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <Input
            label="Precio"
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <label className="text-sm font-medium text-slate-700">Aplicar IVA</label>
            <input
              type="checkbox"
              checked={formData.apply_tax as boolean}
              onChange={(e) => setFormData({ ...formData, apply_tax: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
