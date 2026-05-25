import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Button } from '../ui/Button'
import { Shield, Lock, User, CircleAlert as AlertCircle } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

interface LoginProps {
  onLogin: (user: any) => void
}

export const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await window.api.login(username, password)
      if (result.success && result.user) {
        showToast('Sesion iniciada correctamente', 'success')
        onLogin(result.user)
      } else {
        setError(result.error || 'Credenciales incorrectas')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">LIADENT</h1>
          <p className="text-slate-400 mt-2 font-medium">Gestión Odontológica Profesional</p>
        </div>

        <Card className="border-slate-800 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa tus credenciales para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Acceder al Sistema'}
              </Button>

              <div className="text-center pt-2">
                <button type="button" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                  ¿Olvidaste tu contraseña? Contacta al administrador.
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Cumple con HIPAA / RGPD • Conexión Cifrada • 2026 LIADENT CRM
          </p>
        </div>
      </div>
    </div>
  )
}
