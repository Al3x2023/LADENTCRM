import React, { useState } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './modules/dashboard/Dashboard'
import { Patients } from './modules/patients/Patients'
import { Appointments } from './modules/appointments/Appointments'
import { Billing } from './modules/billing/Billing'
import { StaffAdmin } from './modules/staff/StaffAdmin'
import { Settings } from './modules/settings/Settings'
import { Login } from './components/auth/Login'

const App = () => {
  const [user, setUser] = useState<any>(null)
  const [activeModule, setActiveModule] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState<any>(undefined)
  const [patientsView, setPatientsView] = useState<'list' | 'form' | 'history'>('list')

  const handleLogin = (userData: any) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setActiveModule('dashboard')
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard 
                 setActiveModule={setActiveModule} 
                 setSelectedPatient={setSelectedPatient}
                 setView={setPatientsView}
               />
      case 'patients':
        return <Patients 
                 initialView={patientsView}
                 initialPatient={selectedPatient}
               />
      case 'appointments':
        return <Appointments 
                 setActiveModule={setActiveModule}
                 setSelectedPatient={setSelectedPatient}
                 setPatientsView={setPatientsView}
               />
      case 'clinical':
        return (
          <div className="p-8 text-center text-slate-500">
            <h2 className="text-2xl font-bold mb-4">HCE (Historial Clínico Electrónico)</h2>
            <p>Módulo de historias clínicas y odontogramas integrado en la ficha del paciente.</p>
            <p className="mt-4 text-sm text-slate-400">Accede a través de Pacientes -{'>'} Ver HCE</p>
          </div>
        )
      case 'billing':
        return <Billing />
      case 'staff':
        return <StaffAdmin />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard 
                 setActiveModule={setActiveModule} 
                 setSelectedPatient={setSelectedPatient}
                 setView={setPatientsView}
               />
    }
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Layout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      onLogout={handleLogout}
      user={user}
    >
      {renderModule()}
    </Layout>
  )
}

export default App
