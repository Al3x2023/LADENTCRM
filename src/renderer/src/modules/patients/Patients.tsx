import React, { useState, useEffect } from 'react'
import { PatientList } from './PatientList'
import { PatientForm } from './PatientForm'
import { ClinicalHistory } from './ClinicalHistory'
import { Patient } from '../../env'
import { useToast } from '../../context/ToastContext'

interface PatientsProps {
  initialView?: 'list' | 'form' | 'history'
  initialPatient?: Patient
}

export const Patients = ({ initialView = 'list', initialPatient }: PatientsProps) => {
  const [view, setView] = useState<'list' | 'form' | 'history'>(initialView)
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(initialPatient)
  const { showToast } = useToast()

  useEffect(() => {
    if (initialPatient && initialView === 'history') {
      setSelectedPatient(initialPatient)
      setView('history')
    }
  }, [initialPatient, initialView])

  const handleAddPatient = () => {
    setSelectedPatient(undefined)
    setView('form')
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setView('form')
  }

  const handleViewHistory = (patient: Patient) => {
    setSelectedPatient(patient)
    setView('history')
  }

  const handleSave = async (patient: Patient) => {
    try {
      if (patient.id) {
        await window.api.updatePatient(patient)
        showToast('Paciente actualizado correctamente', 'success')
      } else {
        await window.api.addPatient(patient)
        showToast('Paciente registrado correctamente', 'success')
      }
      setView('list')
    } catch (error) {
      showToast('Error al guardar el paciente', 'error')
      console.error(error)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {view === 'list' && (
        <PatientList 
          onAddPatient={handleAddPatient} 
          onEditPatient={handleEditPatient}
          onViewClinicalHistory={handleViewHistory}
        />
      )}
      {view === 'form' && (
        <PatientForm 
          patient={selectedPatient} 
          onSave={handleSave} 
          onCancel={() => setView('list')} 
        />
      )}
      {view === 'history' && selectedPatient && (
        <ClinicalHistory 
          patient={selectedPatient} 
          onBack={() => setView('list')} 
        />
      )}
    </div>
  )
}
