import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Settings as SettingsIcon, Database, Bell, Shield, Save } from 'lucide-react'

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'notifications' | 'security'>('general')
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSave = () => {
    showToast('Configuración guardada correctamente', 'success')
  }

  const handleBackup = () => {
    showToast('Copia de seguridad en proceso...', 'info')
    setTimeout(() => {
      showToast('Copia de seguridad completada', 'success')
    }, 2000)
  }

  const handleRestore = () => {
    if (confirm('¿Está seguro de restaurar una copia de seguridad? Esto sobrescribirá los datos actuales.')) {
      showToast('Restauración en proceso...', 'info')
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-indigo-600" /> Configuración del Sistema
          </h2>
          <p className="text-slate-500 mt-1">Personaliza la clínica dental según tus necesidades.</p>
        </div>
      </div>

      {toastMessage && (
        <div className={`p-4 rounded-lg ${toastMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : toastMessage.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
          {toastMessage.text}
        </div>
      )}

      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'general', label: 'General', icon: SettingsIcon },
          { id: 'database', label: 'Base de Datos', icon: Database },
          { id: 'notifications', label: 'Notificaciones', icon: Bell },
          { id: 'security', label: 'Seguridad', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-4 text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Clínica</label>
                  <Input defaultValue="LIADENT Dental Clinic" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RFC / CIF</label>
                  <Input defaultValue="ABC123456XYZ" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <Input defaultValue="+52 55 1234 5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input defaultValue="contacto@liadent.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <Input defaultValue="Av. Revolución 123, Col. Centro, Ciudad de México" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horario de Atención</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Apertura</label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Cierre</label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Copias de Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">Realiza copias de seguridad periódicas para proteger tus datos.</p>
              <div className="flex gap-3">
                <Button onClick={handleBackup} className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Crear Copia de Seguridad
                </Button>
                <Button variant="outline" onClick={handleRestore} className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Restaurar Copia
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Copias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { date: '2026-05-19 10:30:00', size: '2.4 MB' },
                  { date: '2026-05-18 22:00:00', size: '2.3 MB' },
                  { date: '2026-05-17 22:00:00', size: '2.2 MB' }
                ].map((backup, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{backup.date}</span>
                    <span className="text-xs text-slate-500">{backup.size}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Recordatorios de Citas</p>
                  <p className="text-sm text-slate-500">Enviar recordatorios automáticos a los pacientes</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notificaciones de Vencimiento</p>
                  <p className="text-sm text-slate-500">Alertar sobre tratamientos próximos a vencer</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Email de Confirmación</p>
                  <p className="text-sm text-slate-500">Enviar email de confirmación al agendar cita</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad y Acceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Autenticación de Dos Factores</p>
                  <p className="text-sm text-slate-500">Requerir 2FA para todos los usuarios</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Registro de Auditoría</p>
                  <p className="text-sm text-slate-500">Registrar todas las acciones del sistema</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Bloqueo Automático</p>
                  <p className="text-sm text-slate-500">Bloquear sesión después de inactividad (15 min)</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-indigo-600" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña de Administrador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
                <Input type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                <Input type="password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                <Input type="password" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
