import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Save, RotateCcw, Info, MousePointer2 } from 'lucide-react'
import { cn } from '../ui/Button'

interface ToothProps {
  id: number
  state: ToothState
  onClick: (id: number) => void
}

type ToothState = 'healthy' | 'decay' | 'missing' | 'restored' | 'filling'

const Tooth = ({ id, state, onClick }: ToothProps) => {
  const getColors = () => {
    switch (state) {
      case 'decay': return 'fill-red-500 stroke-red-700'
      case 'missing': return 'fill-slate-200 stroke-slate-300 opacity-20'
      case 'restored': return 'fill-blue-500 stroke-blue-700'
      case 'filling': return 'fill-amber-500 stroke-amber-700'
      default: return 'fill-white stroke-slate-400 hover:fill-slate-50'
    }
  }

  return (
    <div 
      className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110"
      onClick={() => onClick(id)}
    >
      <span className="text-[10px] font-bold text-slate-400">{id}</span>
      <svg width="30" height="40" viewBox="0 0 30 40" className={cn("transition-colors", getColors())}>
        <path 
          d="M5,10 C5,5 10,2 15,2 C20,2 25,5 25,10 L25,25 C25,32 20,38 15,38 C10,38 5,32 5,25 L5,10" 
          strokeWidth="2"
        />
        <rect x="10" y="10" width="10" height="15" rx="2" fillOpacity="0.3" />
      </svg>
    </div>
  )
}

export const Odontogram = ({ patientId }: { patientId: number }) => {
  const [toothStates, setToothStates] = useState<Record<number, ToothState>>({})
  const [selectedTool, setSelectedTool] = useState<ToothState>('decay')

  useEffect(() => {
    loadOdontogram()
  }, [patientId])

  const loadOdontogram = async () => {
    const data = await window.api.getOdontogram(patientId)
    if (data && data.data) {
      setToothStates(JSON.parse(data.data))
    }
  }

  const handleToothClick = (id: number) => {
    setToothStates(prev => ({
      ...prev,
      [id]: prev[id] === selectedTool ? 'healthy' : selectedTool
    }))
  }

  const handleSave = async () => {
    await window.api.saveOdontogram(patientId, JSON.stringify(toothStates))
    // showToast from context would be nice here, but for now just console
  }

  const toothRows = [
    [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
  ]

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Odontograma Interactivo</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Selecciona una condición y haz clic en las piezas dentales.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setToothStates({})} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reiniciar
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Guardar Cambios
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-8 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">
            <MousePointer2 className="w-3 h-3 mr-1" /> Herramientas:
          </span>
          {[
            { id: 'decay', label: 'Caries', color: 'bg-red-500' },
            { id: 'filling', label: 'Obturación', color: 'bg-amber-500' },
            { id: 'restored', label: 'Tratado', color: 'bg-blue-500' },
            { id: 'missing', label: 'Ausente', color: 'bg-slate-300' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id as ToothState)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                selectedTool === tool.id 
                  ? "bg-white border-slate-200 shadow-sm scale-105" 
                  : "bg-transparent border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", tool.color)}></div>
              {tool.label}
            </button>
          ))}
        </div>

        <div className="space-y-12 py-4">
          {toothRows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-2 md:gap-4 overflow-x-auto pb-4">
              {row.map(id => (
                <Tooth 
                  key={id} 
                  id={id} 
                  state={toothStates[id] || 'healthy'} 
                  onClick={handleToothClick} 
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 leading-relaxed">
            <p className="font-bold mb-1">Nota clínica:</p>
            El odontograma utiliza la nomenclatura FDI. Los cambios realizados aquí se guardarán permanentemente en el historial clínico del paciente y podrán ser consultados en futuras visitas.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
