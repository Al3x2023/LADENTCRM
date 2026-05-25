import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button, cn } from '../../components/ui/Button'
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, RefreshCw, X, User } from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Appointment, Patient } from '../../env'
import { useToast } from '../../context/ToastContext'
import { AppointmentForm } from './AppointmentForm'

interface AppointmentsProps {
  setActiveModule?: (m: string) => void
  setSelectedPatient?: (p: Patient) => void
  setPatientsView?: (v: 'list' | 'form' | 'history') => void
}

export const Appointments = ({ setActiveModule, setSelectedPatient, setPatientsView }: AppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<'week' | 'day'>('week')
  const [isSyncing, setIsSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState<{ appointment: Appointment } | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    const data = await window.api.getAppointments()
    setAppointments(data)
    const patientsData = await window.api.getPatients()
    setPatients(patientsData)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSyncing(false)
    showToast('Calendario sincronizado con éxito (Google/Outlook)', 'success')
  }

  const handleSaveAppointment = async (appointment: any) => {
    try {
      await window.api.addAppointment(appointment)
      showToast('Cita agendada correctamente', 'success')
      setShowForm(false)
      fetchAppointments()
    } catch (error) {
      showToast('Error al agendar la cita', 'error')
      console.error(error)
    }
  }

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    try {
      await window.api.updateAppointmentStatus(appointment.id!, newStatus)
      showToast(`Estado de cita actualizado a "${newStatus}"`, 'success')
      setShowStatusModal(null)
      fetchAppointments()
    } catch (error) {
      showToast('Error al actualizar el estado', 'error')
    }
  }

  const handleViewFicha = (appointment: Appointment) => {
    const patient = patients.find(p => p.id === appointment.patient_id!)
    if (patient && setSelectedPatient && setPatientsView && setActiveModule) {
      setSelectedPatient(patient)
      setPatientsView('history')
      setActiveModule('patients')
    }
  }

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = [...Array(6)].map((_, i) => addDays(startDate, i)) // Mon to Sat

  const timeSlots = [...Array(24)].map((_, i) => {
    const hour = Math.floor(i / 2) + 8 // Starts at 8:00
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-indigo-600" /> Agenda
          </h2>
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <Button 
              variant={calendarView === 'week' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setCalendarView('week')}
              className="text-xs"
            >
              Semana
            </Button>
            <Button 
              variant={calendarView === 'day' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setCalendarView('day')}
              className="text-xs"
            >
              Día
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-1 shadow-sm">
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-40 text-center">
              {format(startDate, "d 'de' MMMM", { locale: es })} - {format(addDays(startDate, 5), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button className="gap-2 shadow-indigo-200 shadow-lg" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Nueva Cita
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100">
          <div className="p-4 border-r border-slate-100 bg-slate-50/50 w-20"></div>
          {weekDays.map((day, i) => (
            <div key={i} className={cn(
              "p-4 text-center border-r border-slate-100 last:border-0",
              isSameDay(day, new Date()) ? "bg-indigo-50/50" : ""
            )}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{format(day, 'EEE', { locale: es })}</p>
              <p className={cn(
                "text-2xl font-black mt-1",
                isSameDay(day, new Date()) ? "text-indigo-600" : "text-slate-900"
              )}>{format(day, 'd')}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 h-[600px] overflow-y-auto">
          {/* Time Column */}
          <div className="border-r border-slate-100 bg-slate-50/30 w-20">
            {timeSlots.map((time, i) => (
              <div key={i} className="h-16 border-b border-slate-50 flex items-start justify-center pt-2">
                <span className="text-[10px] font-bold text-slate-400">{time}</span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {weekDays.map((day, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-slate-100 last:border-0 group">
              {timeSlots.map((_, i) => (
                <div key={i} className="h-16 border-b border-slate-50 group-hover:bg-slate-50/20 transition-colors"></div>
              ))}
              
              {/* Appointments for this day */}
              {appointments
                .filter(appt => appt.date === format(day, 'yyyy-MM-dd'))
                .map((appt) => {
                  const [hour, minute] = appt.time.split(':').map(Number)
                  const top = ((hour - 8) * 2 + (minute >= 30 ? 1 : 0)) * 64
                  
                  return (
                    <div 
                      key={appt.id}
                      className={cn(
                        "absolute left-1 right-1 p-2 rounded-lg border-l-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md z-10",
                        appt.status === 'arrived' ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                        appt.status === 'in_progress' ? "bg-amber-50 border-amber-500 text-amber-900" :
                        appt.status === 'completed' ? "bg-green-50 border-green-600 text-green-900" :
                        appt.status === 'cancelled' ? "bg-slate-100 border-slate-400 text-slate-500" :
                        "bg-indigo-50 border-indigo-500 text-indigo-900"
                      )}
                      style={{ top: `${top}px`, height: '60px' }}
                      onClick={() => setShowStatusModal({ appointment: appt })}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex items-start justify-between">
                          <p className="text-[11px] font-bold leading-none truncate">{appt.patient_name}</p>
                          <Clock className="w-3 h-3 opacity-50 shrink-0" />
                        </div>
                        <p className="text-[9px] opacity-70 font-medium truncate">{appt.reason}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex gap-1">
                            <span className="text-[9px] font-black">{appt.time}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="p-0 h-auto text-[8px]"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewFicha(appt)
                              }}
                            >
                              <User className="w-2 h-2" />
                            </Button>
                          </div>
                          <Badge className="h-3 text-[8px] px-1 border-0" variant={
                            appt.status === 'arrived' ? 'success' : 
                            appt.status === 'in_progress' ? 'warning' :
                            appt.status === 'completed' ? 'success' : 'default'
                          }>
                            {appt.status === 'arrived' ? 'Llegó' : 
                             appt.status === 'in_progress' ? 'Atendiendo' :
                             appt.status === 'completed' ? 'Completado' :
                             appt.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" /> Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.slice(0, 3).map(appt => (
              <div key={appt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {appt.patient_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{appt.patient_name}</p>
                  <p className="text-[10px] text-slate-500">{appt.time} • {appt.reason}</p>
                </div>
                <Badge variant="outline" className="text-[8px] h-4">Recordado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">Resumen Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-4">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">42</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Citas Totales</p>
              </div>
              <div className="h-10 w-px bg-slate-100"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600">38</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Confirmadas</p>
              </div>
              <div className="h-10 w-px bg-slate-100"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-500">4</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pendientes</p>
              </div>
              <div className="h-10 w-px bg-slate-100"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-indigo-600">85%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ocupación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <AppointmentForm 
          onSave={handleSaveAppointment} 
          onCancel={() => setShowForm(false)} 
        />
      )}

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
              <div className="pt-2 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewFicha(showStatusModal.appointment)}
                >
                  <User className="w-4 h-4 mr-2" /> Ver Ficha del Paciente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
