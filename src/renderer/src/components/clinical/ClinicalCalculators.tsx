import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Calculator, Activity, Info } from 'lucide-react'
import { cn } from '../ui/Button'

export const ClinicalCalculators = () => {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)

  const calculateBmi = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100 // cm to m
    if (w && h) {
      setBmi(parseFloat((w / (h * h)).toFixed(2)))
    }
  }

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Bajo peso', color: 'text-amber-500' }
    if (val < 25) return { label: 'Normal', color: 'text-emerald-500' }
    if (val < 30) return { label: 'Sobrepeso', color: 'text-amber-500' }
    return { label: 'Obesidad', color: 'text-red-500' }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-500" /> Calculadora de IMC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Peso (kg)" 
              placeholder="70" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
            />
            <Input 
              label="Altura (cm)" 
              placeholder="175" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)} 
            />
          </div>
          <Button onClick={calculateBmi} className="w-full">Calcular IMC</Button>

          {bmi && (
            <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tu IMC es</p>
              <p className="text-5xl font-black text-slate-900 my-2">{bmi}</p>
              <p className={cn("text-lg font-bold", getBmiCategory(bmi).color)}>
                {getBmiCategory(bmi).label}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" /> Otras Herramientas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Conversor de Unidades</h4>
            <p className="text-xs text-slate-500">mg/dl a mmol/l y otras conversiones clínicas.</p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Dosis Pediátricas</h4>
            <p className="text-xs text-slate-500">Cálculo de dosis por peso para pacientes infantiles.</p>
          </div>
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3">
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className="text-[10px] text-indigo-900 leading-tight">
              Estas herramientas son de apoyo. Siempre verifique los resultados antes de emitir un diagnóstico o tratamiento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
