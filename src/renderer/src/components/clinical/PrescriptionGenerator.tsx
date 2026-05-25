import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Trash2, Printer, Save, FileText, Pill } from 'lucide-react'
import { Prescription } from '../../env'

interface PrescriptionGeneratorProps {
  patientId: number
  patientName: string
  onSave: (prescription: Prescription) => void
}

export const PrescriptionGenerator = ({ patientId, patientName, onSave }: PrescriptionGeneratorProps) => {
  const [medications, setMedications] = useState([{ name: '', dose: '', freq: '', duration: '' }])
  const [instructions, setInstructions] = useState('')

  const addMedication = () => {
    setMedications([...medications, { name: '', dose: '', freq: '', duration: '' }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...medications]
    newMeds[index][field] = value
    setMedications(newMeds)
  }

  const handleSave = () => {
    const medsString = medications
      .filter(m => m.name)
      .map(m => `${m.name} - ${m.dose} (${m.freq}) por ${m.duration}`)
      .join('\n')

    onSave({
      patient_id: patientId,
      medications: medsString,
      instructions: instructions,
      date: new Date().toISOString()
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-500" /> Detalle de Medicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative">
                {medications.length > 1 && (
                  <button 
                    onClick={() => removeMedication(index)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input 
                      placeholder="Nombre del medicamento (ej: Amoxicilina 500mg)" 
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    />
                  </div>
                  <Input 
                    placeholder="Dosis (ej: 1 tableta)" 
                    value={med.dose}
                    onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                  />
                  <Input 
                    placeholder="Frecuencia (ej: cada 8 horas)" 
                    value={med.freq}
                    onChange={(e) => updateMedication(index, 'freq', e.target.value)}
                  />
                  <div className="col-span-2">
                    <Input 
                      placeholder="Duración (ej: por 7 días)" 
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addMedication}>
            <Plus className="w-4 h-4" /> Agregar Medicamento
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Instrucciones Adicionales</label>
            <textarea 
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              rows={4}
              placeholder="Ej: Tomar con abundante agua, evitar lácteos..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" /> Guardar Receta
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-dashed border-slate-300">
        <CardHeader>
          <CardTitle className="text-sm text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4" /> Vista Previa de Receta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-black text-indigo-600">LIADENT</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clínica Dental Profesional</p>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <p>Fecha: {new Date().toLocaleDateString()}</p>
                <p>Folio: #REC-{Math.floor(Math.random() * 10000)}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Paciente:</p>
              <p className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">{patientName}</p>
            </div>

            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Indicaciones:</p>
              <div className="space-y-4">
                {medications.filter(m => m.name).map((med, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-bold text-indigo-600">Rx.</span>
                    <div>
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <p className="text-sm text-slate-600 italic">Tomar {med.dose} {med.freq} {med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>

              {instructions && (
                <div className="mt-8 pt-6 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Notas adicionales:</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{instructions}</p>
                </div>
              )}
            </div>

            <div className="mt-20 flex justify-center flex-col items-center">
              <div className="w-48 border-t border-slate-300 mb-2"></div>
              <p className="text-xs font-bold text-slate-900">Dr. Alejandro</p>
              <p className="text-[10px] text-slate-500 font-medium">Cédula Profesional: 12345678</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
