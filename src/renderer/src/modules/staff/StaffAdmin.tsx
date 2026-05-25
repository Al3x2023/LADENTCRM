import React, { useState } from 'react'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { UserCog, Shield, UserCheck } from 'lucide-react'
import { cn } from '../../components/ui/Button'

export const StaffAdmin = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'audit'>('staff')

  // En un caso real, esto vendría de window.api
  const mockStaff = [
    { id: 1, name: 'Dr. Alejandro', role: 'Administrador', specialty: 'Odontología General', status: 'active' },
    { id: 2, name: 'Dra. María García', role: 'Doctor', specialty: 'Ortodoncia', status: 'active' },
    { id: 3, name: 'Laura Pérez', role: 'Recepcionista', specialty: '-', status: 'active' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <UserCog className="w-8 h-8 text-indigo-600" /> Administración y Seguridad
          </h2>
          <p className="text-slate-500 mt-1">Control de acceso, personal y auditoría del sistema.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('staff')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'staff' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Personal Médico
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={cn(
            "pb-4 px-2 text-sm font-bold transition-all",
            activeTab === 'audit' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Registro de Auditoría (HIPAA/RGPD)
        </button>
      </div>

      {activeTab === 'staff' ? (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Seguridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStaff.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">{member.specialty}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="success" className="h-5 text-[9px]">MFA</Badge>
                        <Badge variant="indigo" className="h-5 text-[9px]">Encrypted</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Activo
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">Editar Permisos</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-slate-900 text-slate-300 border-none shadow-2xl">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Trazabilidad Completa de Acciones
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table className="text-slate-400">
                <TableHeader className="bg-slate-800/50 border-slate-700">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-300">Timestamp</TableHead>
                    <TableHead className="text-slate-300">Usuario</TableHead>
                    <TableHead className="text-slate-300">Módulo</TableHead>
                    <TableHead className="text-slate-300">Acción</TableHead>
                    <TableHead className="text-slate-300">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { time: '2026-05-19 12:45:12', user: 'admin', module: 'PATIENTS', action: 'UPDATE', details: 'Modificación de historial clínico ID #42' },
                    { time: '2026-05-19 12:30:05', user: 'dr_alejandro', module: 'CLINICAL', action: 'CREATE', details: 'Nueva nota de evolución paciente #12' },
                    { time: '2026-05-19 12:15:44', user: 'recepcion', module: 'BILLING', action: 'EXPORT', details: 'Exportación masiva de facturas PDF' },
                    { time: '2026-05-19 11:50:22', user: 'admin', module: 'SECURITY', action: 'LOGIN', details: 'Inicio de sesión exitoso IP 192.168.1.1' },
                  ].map((log, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/30">
                      <TableCell className="text-[10px] font-mono">{log.time}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-200">{log.user}</TableCell>
                      <TableCell><Badge className="bg-slate-700 text-slate-300 border-none text-[9px]">{log.module}</Badge></TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-[10px] font-black px-1.5 py-0.5 rounded",
                          log.action === 'UPDATE' ? "bg-amber-900/30 text-amber-400" :
                          log.action === 'CREATE' ? "bg-emerald-900/30 text-emerald-400" :
                          "bg-blue-900/30 text-blue-400"
                        )}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs italic opacity-70">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
