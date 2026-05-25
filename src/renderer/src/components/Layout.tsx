import React from 'react'
import { Sidebar } from './Sidebar'
import { Bell, Search } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  activeModule: string
  setActiveModule: (module: string) => void
  onLogout: () => void
  user: any
}

export const Layout = ({ children, activeModule, setActiveModule, onLogout, user }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar pacientes, citas..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user.full_name}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {user.full_name[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  )
}
