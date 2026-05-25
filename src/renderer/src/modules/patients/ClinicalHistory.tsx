import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Stethoscope, Plus, Clock, Activity, Save, Pill, Printer } from 'lucide-react'
import { Patient, ClinicalNote, Prescription } from '../../env'
import { Odontogram } from '../../components/clinical/Odontogram'
import { PrescriptionGenerator } from '../../components/clinical/PrescriptionGenerator'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../components/ui/Button'
import { generatePrescriptionPDF } from '../../utils/pdf'

interface ClinicalHistoryProps {
  patient: Patient
  onBack: () => void
}

export const ClinicalHistory = ({ patient, onBack }: ClinicalHistoryProps) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'odontogram' | 'prescriptions'>('notes')
  const [notes, setNotes] = useState<ClinicalNote[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isAddingPrescription, setIsAddingPrescription] = useState(false)
  const [newNote, setNewNote] = useState({ content: '', vitals: { temp: '', bp: '', heartRate: '' } })
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [patient.id])

  const fetchData = async () => {
    if (patient.id) {
      const notesData = await window.api.getClinicalNotes(patient.id)
      setNotes(notesData)
      const prescriptionsData = await window.api.getPrescriptions(patient.id)
      setPrescriptions(prescriptionsData)
    }
  }

  const handleSaveNote = async () => {
    if (!newNote.content.trim()) return

    try {
      await window.api.addClinicalNote({
        patient_id: patient.id!,
        content: newNote.content,
        vitals_signs: JSON.stringify(newNote.vitals)
      })
      
      setNewNote({ content: '', vitals: { temp: '', bp: '', heartRate: '' } })
      setIsAddingNote(false)
      fetchData()
      showToast('Nota de evolución guardada correctamente', 'success')
    } catch (error) {
      showToast('Error al guardar la nota', 'error')
    }
  }

  const handleSavePrescription = async (prescription: Prescription) => {
    try {
      await window.api.addPrescription(prescription)
      setIsAddingPrescription(false)
      fetchData()
      showToast('Receta médica generada correctamente', 'success')
    } catch (error) {
      showToast('Error al generar la receta', 'error')
    }
  }

  const handlePrintPrescription = (pres: Prescription) => {
    showToast('Generando PDF de receta...', 'info')
    setTimeout(() => {
      generatePrescriptionPDF(pres, patient)
      showToast('PDF de receta generado y guardado en Descargas', 'success')
    }, 500)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>Volver</Button>
          <h2 className="text-2xl font-bold text-slate-900">Historial Clínico: {patient.name}</h2>
        </div>
        <div className="flex gap-2">
          {activeTab === 'notes' && (
            <Button onClick={() => setIsAddingNote(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Nueva Evolución
            </Button>
          )}
          {activeTab === 'prescriptions' && (
            <Button onClick={() => setIsAddingPrescription(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Nueva Receta
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => { setActiveTab('notes'); setIsAddingPrescription(false); }}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'notes' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Notas de Evolución
        </button>
        <button 
          onClick={() => { setActiveTab('odontogram'); setIsAddingPrescription(false); }}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'odontogram' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Odontograma
        </button>
        <button 
          onClick={() => { setActiveTab('prescriptions'); setIsAddingPrescription(false); }}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'prescriptions' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Recetas Médicas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'notes' && (
            <>
              {isAddingNote && (
                <Card className="border-indigo-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Nueva Nota de Evolución</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Input 
                        label="Temp. (°C)" 
                        placeholder="36.5" 
                        value={newNote.vitals.temp}
                        onChange={(e) => setNewNote({...newNote, vitals: {...newNote.vitals, temp: e.target.value}})}
                      />
                      <Input 
                        label="P. Arterial" 
                        placeholder="120/80" 
                        value={newNote.vitals.bp}
                        onChange={(e) => setNewNote({...newNote, vitals: {...newNote.vitals, bp: e.target.value}})}
                      />
                      <Input 
                        label="Frec. Card." 
                        placeholder="72" 
                        value={newNote.vitals.heartRate}
                        onChange={(e) => setNewNote({...newNote, vitals: {...newNote.vitals, heartRate: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Contenido de la nota</label>
                      <textarea 
                        className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        rows={6}
                        placeholder="Describe los hallazgos clínicos, diagnóstico y tratamiento..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancelar</Button>
                      <Button onClick={handleSaveNote} className="gap-2">
                        <Save className="w-4 h-4" /> Guardar Nota
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <Card key={note.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-500">
                              {new Date(note.created_at!).toLocaleString()}
                            </span>
                          </div>
                          <Badge variant="secondary">Evolución</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {note.vitals_signs && (
                          <div className="flex gap-4 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium text-slate-600">
                            {(() => {
                              try {
                                const vitals = JSON.parse(note.vitals_signs!)
                                return (
                                  <>
                                    {vitals.temp && <span>T°: {vitals.temp}°C</span>}
                                    {vitals.bp && <span>PA: {vitals.bp}</span>}
                                    {vitals.heartRate && <span>FC: {vitals.heartRate} lpm</span>}
                                  </>
                                )
                              } catch (e) { return null }
                            })()}
                          </div>
                        )}
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-xs text-slate-400">
                            Atendido por: <span className="text-slate-600 font-medium">{note.doctor_name || 'Dr. Alejandro'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                    <Stethoscope className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay notas registradas para este paciente.</p>
                    <Button variant="link" onClick={() => setIsAddingNote(true)}>Crear la primera nota</Button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'odontogram' && patient.id && (
            <Odontogram patientId={patient.id} />
          )}

          {activeTab === 'prescriptions' && (
            <>
              {isAddingPrescription ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingPrescription(false)}>Volver a la lista</Button>
                    <h3 className="text-lg font-bold">Generador de Receta</h3>
                  </div>
                  <PrescriptionGenerator 
                    patientId={patient.id!} 
                    patientName={patient.name} 
                    onSave={handleSavePrescription} 
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.length > 0 ? (
                    prescriptions.map((pres) => (
                      <Card key={pres.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-500">
                                {new Date(pres.date!).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge variant="success">Emitida</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {pres.medications}
                          </p>
                          {pres.instructions && (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-900">
                              <p className="font-bold mb-1">Instrucciones:</p>
                              {pres.instructions}
                            </div>
                          )}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-400">
                              Médico: <span className="text-slate-600 font-medium">{pres.doctor_name || 'Dr. Alejandro'}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs gap-2"
                              onClick={() => handlePrintPrescription(pres)}
                            >
                              <Printer className="w-3 h-3" /> Imprimir PDF
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                      <Pill className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No hay recetas emitidas para este paciente.</p>
                      <Button variant="link" onClick={() => setIsAddingPrescription(true)}>Generar nueva receta</Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" /> Resumen Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Alergias</span>
                <p className="text-sm font-semibold text-red-600">{patient.allergies || 'Ninguna conocida'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Grupo Sanguíneo</span>
                <p className="text-sm font-semibold text-slate-900">{patient.blood_type || 'No registrado'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Antecedentes</span>
                <p className="text-sm text-slate-600 leading-relaxed">{patient.notes || 'Sin antecedentes relevantes'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadísticas del Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Consultas:</span>
                <span className="font-bold text-slate-900">{notes.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Recetas Emitidas:</span>
                <span className="font-bold text-slate-900">{prescriptions.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Última Visita:</span>
                <span className="font-bold text-slate-900">
                  {notes.length > 0 ? new Date(notes[0].created_at!).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
