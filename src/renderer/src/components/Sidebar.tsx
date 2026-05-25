import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  UserCog, 
  Settings,
  LogOut,
  Stethoscope
} from 'lucide-react'
import { cn } from './ui/Button'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
  onLogout: () => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'appointments', label: 'Agenda', icon: Calendar },
  { id: 'clinical', label: 'HCE', icon: Stethoscope },
  { id: 'billing', label: 'Facturación', icon: CreditCard },
  { id: 'staff', label: 'Personal', icon: UserCog },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export const Sidebar = ({ activeModule, setActiveModule, onLogout }: SidebarProps) => {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">LIADENT</h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">CRM Dental</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                activeModule === item.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'hover:bg-slate-800 hover:text-white border border-transparent'
              )}
            >
              <item.icon className={cn('w-5 h-5', activeModule === item.id ? 'text-indigo-400' : 'text-slate-500')} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
