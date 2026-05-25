import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ArrowLeft, Save, User, Phone, Heart } from 'lucide-react'
import { Patient } from '../../env'

interface PatientFormProps {
  patient?: Patient
  onSave: (patient: Patient) => void
  onCancel: () => void
}

export const PatientForm = ({ patient, onSave, onCancel }: PatientFormProps) => {
  const [formData, setFormData] = useState<Partial<Patient>>(
    patient || {
      name: '',
      id_number: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      gender: '',
      blood_type: '',
      allergies: '',
      notes: ''
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name?.trim()) newErrors.name = 'El nombre es obligatorio'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (formData.phone && !/^\+?[\d\s-]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Teléfono inválido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData as Patient)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">
          {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" /> Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Nombre Completo" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  error={errors.name}
                  required 
                />
                <Input 
                  label="DNI / Identificación" 
                  name="id_number" 
                  value={formData.id_number} 
                  onChange={handleChange} 
                />
                <Input 
                  label="Fecha de Nacimiento" 
                  name="birth_date" 
                  type="date" 
                  value={formData.birth_date} 
                  onChange={handleChange} 
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Género</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-500" /> Contacto y Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Teléfono" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  error={errors.phone}
                />
                <Input 
                  label="Correo Electrónico" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  error={errors.email}
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Dirección" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" /> Información Médica
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Grupo Sanguíneo" 
                  name="blood_type" 
                  value={formData.blood_type} 
                  onChange={handleChange} 
                />
                <Input 
                  label="Alergias" 
                  name="allergies" 
                  value={formData.allergies} 
                  onChange={handleChange} 
                  placeholder="Ej: Penicilina, Látex..."
                />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Notas Adicionales</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-indigo-50 border-indigo-100">
              <CardHeader>
                <CardTitle className="text-indigo-900 text-base">Resumen de Registro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600 font-medium">Estado:</span>
                  <Badge variant="success">Activo</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600 font-medium">Creado:</span>
                  <span className="text-slate-600">
                    {formData.created_at ? new Date(formData.created_at).toLocaleDateString() : 'Hoy'}
                  </span>
                </div>
                <hr className="border-indigo-100" />
                <Button type="submit" className="w-full gap-2">
                  <Save className="w-4 h-4" /> Guardar Paciente
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
