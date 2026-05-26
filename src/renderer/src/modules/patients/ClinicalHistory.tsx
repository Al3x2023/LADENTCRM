import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { ConfirmModal } from '../../components/ui/Modal'
import { Stethoscope, Plus, Clock, Activity, Save, Pill, Printer, Image, Upload, Trash2, X } from 'lucide-react'
import { Patient, ClinicalNote, Prescription } from '../../env'
import { Odontogram } from '../../components/clinical/Odontogram'
import { PrescriptionGenerator } from '../../components/clinical/PrescriptionGenerator'
import { ClinicalCalculators } from '../../components/clinical/ClinicalCalculators'
import { TreatmentsTab } from './TreatmentsTab'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../components/ui/Button'
import { generatePrescriptionPDF } from '../../utils/pdf'

interface ClinicalHistoryProps {
  patient: Patient
  onBack: () => void
}

export const ClinicalHistory = ({ patient, onBack }: ClinicalHistoryProps) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'odontogram' | 'prescriptions' | 'images' | 'concepts' | 'calculators'>('notes')
  const [notes, setNotes] = useState<ClinicalNote[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [images, setImages] = useState<any[]>([])
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isAddingPrescription, setIsAddingPrescription] = useState(false)
  const [newNote, setNewNote] = useState({ content: '', vitals: { temp: '', bp: '', heartRate: '' } })
  const [deleteImageTarget, setDeleteImageTarget] = useState<any | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
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
      const imagesData = await window.api.getPatientImages(patient.id)
      setImages(imagesData)
      const urls: Record<string, string> = {}
      for (const img of imagesData) {
        const url = await window.api.getImageUrl(img.file_name)
        if (url) urls[img.file_name] = url
      }
      setImageUrls(urls)
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
      showToast('Nota de evolucion guardada correctamente', 'success')
    } catch (error) {
      showToast('Error al guardar la nota', 'error')
    }
  }

  const handleSavePrescription = async (prescription: Prescription) => {
    try {
      await window.api.addPrescription(prescription)
      setIsAddingPrescription(false)
      fetchData()
      showToast('Receta medica generada correctamente', 'success')
    } catch (error) {
      showToast('Error al generar la receta', 'error')
    }
  }

  const handlePrintPrescription = (pres: Prescription) => {
    showToast('Generando PDF de receta...', 'info')
    setTimeout(() => {
      generatePrescriptionPDF(pres, patient)
      showToast('PDF de receta generado', 'success')
    }, 500)
  }

  const handleUploadImage = async (category: string) => {
    try {
      const result = await window.api.uploadPatientImage(patient.id!, category)
      if (result.success) {
        showToast('Imagen subida correctamente', 'success')
        fetchData()
      }
    } catch (error) {
      showToast('Error al subir la imagen', 'error')
    }
  }

  const handleDeleteImage = async (img: any) => {
    try {
      await window.api.deletePatientImage(img.id, img.file_name)
      showToast('Imagen eliminada', 'success')
      fetchData()
    } catch (error) {
      showToast('Error al eliminar la imagen', 'error')
    }
  }

  const tabs = [
    { id: 'notes', label: 'Notas de Evolucion' },
    { id: 'odontogram', label: 'Odontograma' },
    { id: 'prescriptions', label: 'Recetas Medicas' },
    { id: 'images', label: 'Imagenes' },
  ] as const

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>Volver</Button>
          <h2 className="text-2xl font-bold text-slate-900">Historial Clinico: {patient.name}</h2>
        </div>
        <div className="flex gap-2">
          {activeTab === 'notes' && (
            <Button onClick={() => setIsAddingNote(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Nueva Evolucion
            </Button>
          )}
          {activeTab === 'prescriptions' && (
            <Button onClick={() => setIsAddingPrescription(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Nueva Receta
            </Button>
          )}
          {activeTab === 'images' && (
            <Button onClick={() => handleUploadImage('general')} className="gap-2">
              <Upload className="w-4 h-4" /> Subir Imagen
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsAddingPrescription(false); }}
            className={cn(
              "pb-4 px-2 text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setActiveTab('concepts')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'concepts' ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Conceptos
        </button>
        <button
          onClick={() => setActiveTab('calculators')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'calculators' ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Calculadoras
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'notes' && (
            <>
              {isAddingNote && (
                <Card className="border-teal-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Nueva Nota de Evolucion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Temp. (C)"
                        placeholder="36.5"
                        value={newNote.vitals.temp}
                        onChange={(e) => setNewNote({ ...newNote, vitals: { ...newNote.vitals, temp: e.target.value } })}
                      />
                      <Input
                        label="P. Arterial"
                        placeholder="120/80"
                        value={newNote.vitals.bp}
                        onChange={(e) => setNewNote({ ...newNote, vitals: { ...newNote.vitals, bp: e.target.value } })}
                      />
                      <Input
                        label="Frec. Card."
                        placeholder="72"
                        value={newNote.vitals.heartRate}
                        onChange={(e) => setNewNote({ ...newNote, vitals: { ...newNote.vitals, heartRate: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Contenido de la nota</label>
                      <textarea
                        className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                        rows={6}
                        placeholder="Describe los hallazgos clinicos, diagnostico y tratamiento..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
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
                          <Badge variant="secondary">Evolucion</Badge>
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
                                    {vitals.temp && <span>T: {vitals.temp}C</span>}
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
                        <div className="pt-4 border-t border-slate-100">
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
                              Medico: <span className="text-slate-600 font-medium">{pres.doctor_name || 'Dr. Alejandro'}</span>
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

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.length > 0 ? images.map((img) => (
                  <Card key={img.id} className="overflow-hidden group">
                    <div className="relative aspect-square bg-slate-100">
                      {imageUrls[img.file_name] ? (
                        <img
                          src={imageUrls[img.file_name]}
                          alt={img.category || 'Imagen del paciente'}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setLightboxImage(imageUrls[img.file_name])}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Image className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="danger"
                          className="h-7 w-7 p-0"
                          onClick={() => setDeleteImageTarget(img)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">{img.category || 'General'}</Badge>
                        <span className="text-[10px] text-slate-400">
                          {new Date(img.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-3 text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                    <Image className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay imagenes para este paciente.</p>
                    <Button variant="link" onClick={() => handleUploadImage('general')}>Subir primera imagen</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'concepts' && (
            <TreatmentsTab />
          )}

          {activeTab === 'calculators' && (
            <ClinicalCalculators />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" /> Resumen Clinico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Alergias</span>
                <p className="text-sm font-semibold text-red-600">{patient.allergies || 'Ninguna conocida'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Grupo Sanguineo</span>
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
              <CardTitle className="text-base">Estadisticas del Paciente</CardTitle>
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
                <span className="text-slate-500">Imagenes:</span>
                <span className="font-bold text-slate-900">{images.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Ultima Visita:</span>
                <span className="font-bold text-slate-900">
                  {notes.length > 0 ? new Date(notes[0].created_at!).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white" onClick={() => setLightboxImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={lightboxImage} alt="Vista ampliada" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      {/* Delete Image Confirmation */}
      <ConfirmModal
        isOpen={!!deleteImageTarget}
        onClose={() => setDeleteImageTarget(null)}
        onConfirm={() => handleDeleteImage(deleteImageTarget)}
        title="Eliminar Imagen"
        message="Estas seguro de eliminar esta imagen? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
