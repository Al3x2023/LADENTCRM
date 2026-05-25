import React, { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Search, Plus, Phone, Mail, FileSpreadsheet } from 'lucide-react'
import { Patient } from '../../env'
import { exportToCSV } from '../../utils/export'
import { useToast } from '../../context/ToastContext'

interface PatientListProps {
  onAddPatient: () => void
  onEditPatient: (patient: Patient) => void
  onViewClinicalHistory: (patient: Patient) => void
}

export const PatientList = ({ onAddPatient, onEditPatient, onViewClinicalHistory }: PatientListProps) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const data = await window.api.getPatients()
    setPatients(data)
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  )

  const handleExportCSV = () => {
    exportToCSV(
      patients,
      'Pacientes_LIADENT',
      {
        name: 'Nombre',
        id_number: 'DNI/Identificación',
        email: 'Email',
        phone: 'Teléfono',
        birth_date: 'Fecha de Nacimiento',
        address: 'Dirección',
        blood_type: 'Grupo Sanguíneo',
        allergies: 'Alergias',
        created_at: 'Fecha de Registro'
      }
    )
    showToast('Exportación de pacientes completada', 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            className="pl-10" 
            placeholder="Buscar por nombre, DNI o teléfono..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button onClick={onAddPatient} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo Paciente
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>DNI / Identificación</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {patient.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{patient.name}</div>
                        <div className="text-xs text-slate-500">ID: #{patient.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3" /> {patient.phone}
                      </div>
                      <div className="text-xs flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3 h-3" /> {patient.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{patient.id_number || 'No registrado'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onViewClinicalHistory(patient)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        HCE
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onEditPatient(patient)}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No se encontraron pacientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
