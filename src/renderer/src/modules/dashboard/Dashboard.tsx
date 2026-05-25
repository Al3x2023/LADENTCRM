import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Users, Calendar, Activity, TrendingUp, Clock, CheckCircle, Calculator, FileText, X } from 'lucide-react'
import { ClinicalCalculators } from '../../components/clinical/ClinicalCalculators'
import { Patient, Appointment } from '../../env'
import { useToast } from '../../context/ToastContext'

interface DashboardProps {
  setActiveModule: (m: string) => void
  setSelectedPatient?: (p: Patient) => void
  setView?: (v: 'list' | 'form' | 'history') => void
}

export const Dashboard = ({ setActiveModule, setSelectedPatient, setView }: DashboardProps) => {
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, nextAppointmentTime: '' })
  const [patients, setPatients] = useState<Patient[]>([])
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [showCalculators, setShowCalculators] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState<{ appointment: Appointment } | null>(null)
  const { showToast } = useToast()

  const fetchData = async () => {
    const statsData = await window.api.getDashboardStats()
    setStats(statsData)
    const patientsData = await window.api.getPatients()
    setPatients(patientsData)
    const appointments = await window.api.getAppointments()
    const today = new Date().toISOString().split('T')[0]
    const todayApps = appointments
      .filter((a: Appointment) => a.date === today && a.status !== 'cancelled')
      .slice(0, 5)
    setRecentAppointments(todayApps)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleViewFicha = (appointment: Appointment) => {
    const patient = patients.find(p => p.id === appointment.patient_id!)
    if (patient && setSelectedPatient && setView) {
      setSelectedPatient(patient)
      setView('history')
      setActiveModule('patients')
    }
  }

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    try {
      await window.api.updateAppointmentStatus(appointment.id!, newStatus)
      showToast(`Estado de cita actualizado a "${newStatus}"`, 'success')
      setShowStatusModal(null)
      fetchData()
    } catch (error) {
      showToast('Error al actualizar el estado', 'error')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h2>
          <p className="text-slate-500 mt-1">Aquí tienes un resumen de la actividad de hoy en la clínica.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setShowCalculators(!showCalculators)}>
            <Calculator className="w-4 h-4" /> Calculadoras
          </Button>
          <Button variant="outline" onClick={() => setActiveModule('billing')}>
            <FileText className="w-4 h-4" /> Descargar Reporte
          </Button>
          <Button onClick={() => setActiveModule('appointments')}>Nueva Cita</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
              <Users className="w-4 h-4" /> Pacientes Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalPatients}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Citas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.todayAppointments}</div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Próxima: {stats.nextAppointmentTime}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
              <Activity className="w-4 h-4" /> Procedimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">24</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Realizados hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">Activo</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Conectado y Seguro</p>
          </CardContent>
        </Card>
      </div>

      {showCalculators && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <ClinicalCalculators />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appt: Appointment) => (
                  <div key={appt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {appt.patient_name?.[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{appt.patient_name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {appt.time} • {appt.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          appt.status === 'arrived' ? 'success' : 
                          appt.status === 'in_progress' ? 'warning' : 
                          appt.status === 'completed' ? 'success' : 'warning'
                        }
                        className="cursor-pointer"
                        onClick={() => setShowStatusModal({ appointment: appt })}
                      >
                        {appt.status === 'arrived' ? 'En espera' : 
                         appt.status === 'in_progress' ? 'Atendiendo' :
                         appt.status === 'completed' ? 'Completado' :
                         appt.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                      </Badge>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewFicha(appt)}
                        >
                          Ver ficha
                        </Button>
                        {appt.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleStatusChange(appt, 'in_progress')}
                          >
                            Atender
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No hay citas programadas para hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3" variant="outline" onClick={() => setActiveModule('patients')}>
              <Users className="w-4 h-4 text-indigo-500" /> Nuevo Paciente
            </Button>
            <Button className="w-full justify-start gap-3" variant="outline" onClick={() => setActiveModule('appointments')}>
              <Calendar className="w-4 h-4 text-emerald-500" /> Agendar Cita
            </Button>
            <Button className="w-full justify-start gap-3" variant="outline" onClick={() => setActiveModule('billing')}>
              <FileText className="w-4 h-4 text-amber-500" /> Generar Factura
            </Button>
            <Button className="w-full justify-start gap-3" variant="outline" onClick={() => setActiveModule('staff')}>
              <Activity className="w-4 h-4 text-blue-500" /> Ver Reportes
            </Button>
          </CardContent>
        </Card>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Cambiar Estado de Cita</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowStatusModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Paciente: <strong>{showStatusModal.appointment.patient_name}</strong><br />
                Hora: {showStatusModal.appointment.time}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleStatusChange(showStatusModal.appointment, 'pending')}
                >
                  Pendiente
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleStatusChange(showStatusModal.appointment, 'arrived')}
                >
                  Llegó
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => handleStatusChange(showStatusModal.appointment, 'in_progress')}
                >
                  Atendiendo
                </Button>
                <Button 
                  className="bg-green-700 hover:bg-green-800"
                  onClick={() => handleStatusChange(showStatusModal.appointment, 'completed')}
                >
                  Completado
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 col-span-2"
                  onClick={() => handleStatusChange(showStatusModal.appointment, 'cancelled')}
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
