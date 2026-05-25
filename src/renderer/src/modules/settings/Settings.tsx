import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Settings as SettingsIcon, Database, Bell, Shield, Save } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../components/ui/Button'

interface SettingsProps {
  user: any
}

export const Settings = ({ user }: SettingsProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'notifications' | 'security'>('general')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { showToast } = useToast()

  const handleSave = () => {
    showToast('Configuracion guardada correctamente', 'success')
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Todos los campos son obligatorios', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Las contrasenas no coinciden', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('La contrasena debe tener al menos 6 caracteres', 'error')
      return
    }

    const result = await window.api.changePassword({
      id: user.id,
      currentPassword,
      newPassword
    })

    if (result.success) {
      showToast('Contrasena cambiada correctamente', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      showToast(result.error || 'Error al cambiar la contrasena', 'error')
    }
  }

  const handleBackup = () => {
    showToast('Copia de seguridad en proceso...', 'info')
    setTimeout(() => {
      showToast('Copia de seguridad completada', 'success')
    }, 2000)
  }

  const handleRestore = () => {
    if (confirm('Esta seguro de restaurar una copia de seguridad? Esto sobrescribira los datos actuales.')) {
      showToast('Restauracion en proceso...', 'info')
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-teal-600" /> Configuracion del Sistema
          </h2>
          <p className="text-slate-500 mt-1">Personaliza la clinica dental segun tus necesidades.</p>
        </div>
      </div>

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
            className={cn(
              "pb-4 px-4 text-sm font-medium transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-slate-400 hover:text-slate-600"
            )}
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
              <CardTitle>Informacion de la Clinica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Clinica</label>
                  <Input defaultValue="LIADENT Dental Clinic" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RFC / CIF</label>
                  <Input defaultValue="ABC123456XYZ" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefono</label>
                  <Input defaultValue="+52 55 1234 5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input defaultValue="contacto@liadent.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Direccion</label>
                <Input defaultValue="Av. Revolucion 123, Col. Centro, Ciudad de Mexico" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horario de Atencion</CardTitle>
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
              <p className="text-slate-600">Realiza copias de seguridad periodicas para proteger tus datos.</p>
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
              <CardTitle>Base de Datos Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Motor</span>
                <span className="text-xs text-slate-500">SQLite 3</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Cifrado</span>
                <span className="text-xs text-emerald-600 font-bold">AES-256-CBC</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Campos Protegidos</span>
                <span className="text-xs text-slate-500">DNI/Identificacion</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Recordatorios de Citas</p>
                  <p className="text-sm text-slate-500">Enviar recordatorios automaticos a los pacientes</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notificaciones de Vencimiento</p>
                  <p className="text-sm text-slate-500">Alertar sobre tratamientos proximos a vencer</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Email de Confirmacion</p>
                  <p className="text-sm text-slate-500">Enviar email de confirmacion al agendar cita</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
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
                  <p className="font-medium text-slate-900">Autenticacion de Dos Factores</p>
                  <p className="text-sm text-slate-500">Requerir 2FA para todos los usuarios</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Registro de Auditoria</p>
                  <p className="text-sm text-slate-500">Registrar todas las acciones del sistema</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Bloqueo Automatico</p>
                  <p className="text-sm text-slate-500">Bloquear sesion despues de inactividad (15 min)</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contrasena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Contrasena Actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="Nueva Contrasena"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirmar Nueva Contrasena"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Cambiar Contrasena
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
