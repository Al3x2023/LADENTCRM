import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { UserCog, Shield, Plus } from 'lucide-react'
import { cn } from '../../components/ui/Button'
import { User, AuditLog } from '../../env'
import { useToast } from '../../context/ToastContext'

export const StaffAdmin = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'audit'>('staff')
  const [users, setUsers] = useState<User[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'receptionist', email: '' })
  const [resetPassUser, setResetPassUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    if (activeTab === 'staff') {
      const data = await window.api.getUsers()
      setUsers(data)
    } else {
      const result = await window.api.getAuditLogs({ limit: 100, offset: 0 })
      setAuditLogs(result.logs)
      setAuditTotal(result.total)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.full_name) {
      showToast('Todos los campos obligatorios son requeridos', 'error')
      return
    }
    const result = await window.api.addUser(newUser)
    if (result.success) {
      showToast('Usuario creado correctamente', 'success')
      setShowAddUser(false)
      setNewUser({ username: '', password: '', full_name: '', role: 'receptionist', email: '' })
      fetchData()
    } else {
      showToast(result.error || 'Error al crear usuario', 'error')
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    const result = await window.api.updateUser({
      id: editingUser.id,
      full_name: editingUser.full_name,
      role: editingUser.role,
      email: editingUser.email,
      active: editingUser.active ? true : false
    })
    if (result.success) {
      showToast('Usuario actualizado correctamente', 'success')
      setEditingUser(null)
      fetchData()
    } else {
      showToast('Error al actualizar usuario', 'error')
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'doctor': return 'Doctor'
      case 'receptionist': return 'Recepcionista'
      default: return role
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'bg-red-900/30 text-red-400'
    if (action.includes('UPDATE') || action.includes('CHANGE')) return 'bg-amber-900/30 text-amber-400'
    if (action.includes('CREATE') || action.includes('LOGIN')) return 'bg-emerald-900/30 text-emerald-400'
    return 'bg-blue-900/30 text-blue-400'
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <UserCog className="w-8 h-8 text-teal-600" /> Administracion y Seguridad
          </h2>
          <p className="text-slate-500 mt-1">Control de acceso, personal y auditoria del sistema.</p>
        </div>
        {activeTab === 'staff' && (
          <Button className="gap-2" onClick={() => setShowAddUser(true)}>
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('staff')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'staff' ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Personal Medico
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'audit' ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Registro de Auditoria (HIPAA/RGPD)
        </button>
      </div>

      {activeTab === 'staff' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Seguridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ultimo Acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {user.full_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.full_name}</div>
                        <div className="text-xs text-slate-500">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">{user.email || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="success" className="h-5 text-[9px]">Encrypted</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Activo
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> Inactivo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingUser(user)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => setResetPassUser(user)}>
                        Reset Pass
                      </Button>
                      {user.id !== 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={async () => {
                            if (confirm(`Eliminar a ${user.full_name}?`)) {
                              const result = await window.api.deleteUser(user.id)
                              if (result.success) {
                                showToast('Usuario eliminado', 'success')
                                fetchData()
                              }
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="bg-slate-900 text-slate-300 border-none shadow-2xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Trazabilidad Completa de Acciones ({auditTotal} registros)
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table className="text-slate-400">
              <TableHeader className="bg-slate-800/50 border-slate-700">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Timestamp</TableHead>
                  <TableHead className="text-slate-300">Usuario</TableHead>
                  <TableHead className="text-slate-300">Modulo</TableHead>
                  <TableHead className="text-slate-300">Accion</TableHead>
                  <TableHead className="text-slate-300">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length > 0 ? auditLogs.map((log) => (
                  <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="text-[10px] font-mono">{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-200">{log.user_name || log.username || 'Sistema'}</TableCell>
                    <TableCell><Badge className="bg-slate-700 text-slate-300 border-none text-[9px]">{log.module}</Badge></TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded", getActionColor(log.action))}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs italic opacity-70">{log.details || '-'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No hay registros de auditoria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="Nuevo Usuario"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddUser(false)}>Cancelar</Button>
            <Button onClick={handleAddUser}>Crear Usuario</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre Completo" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} required />
          <Input label="Nombre de Usuario" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
          <Input label="Contrasena" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rol</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm"
            >
              <option value="admin">Administrador</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Recepcionista</option>
            </select>
          </div>
          <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Usuario"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button onClick={handleUpdateUser}>Guardar Cambios</Button>
          </>
        }
      >
        {editingUser && (
          <div className="space-y-4">
            <Input label="Nombre Completo" value={editingUser.full_name} onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm"
              >
                <option value="admin">Administrador</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Recepcionista</option>
              </select>
            </div>
            <Input label="Email" type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Estado</label>
              <select
                value={editingUser.active ? '1' : '0'}
                onChange={(e) => setEditingUser({ ...editingUser, active: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm"
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetPassUser}
        onClose={() => { setResetPassUser(null); setNewPassword(''); }}
        title="Resetear Contrasena"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setResetPassUser(null); setNewPassword(''); }}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!newPassword || newPassword.length < 6) {
                  showToast('La contrasena debe tener minimo 6 caracteres', 'error')
                  return
                }
                const result = await window.api.resetUserPassword({ id: resetPassUser!.id, newPassword })
                if (result.success) {
                  showToast(`Contrasena reseteada para ${resetPassUser!.full_name}`, 'success')
                  setResetPassUser(null)
                  setNewPassword('')
                }
              }}
            >
              Resetear
            </Button>
          </>
        }
      >
        {resetPassUser && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-900 font-medium">Usuario: {resetPassUser.full_name}</p>
            </div>
            <Input
              label="Nueva Contrasena"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              required
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
