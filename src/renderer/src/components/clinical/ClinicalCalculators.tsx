import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Calculator, CircleAlert as AlertCircle, Copy } from 'lucide-react'
import { cn } from '../ui/Button'

export const ClinicalCalculators = () => {
  const [activeCalc, setActiveCalc] = useState<'unitConversion' | 'pediatricDose' | 'bmi' | 'imc'>('unitConversion')
  const [copiedResult, setCopiedResult] = useState(false)

  // Unit Conversion
  const [mmolValue, setMmolValue] = useState('')
  const [mgdlValue, setMgdlValue] = useState('')

  const handleUnitConversion = (type: 'mmol' | 'mgdl', value: string) => {
    const num = parseFloat(value)
    if (type === 'mmol') {
      setMmolValue(value)
      setMgdlValue(((num * 18.01559).toFixed(2)) as any)
    } else {
      setMgdlValue(value)
      setMmolValue(((num / 18.01559).toFixed(2)) as any)
    }
  }

  // Pediatric Dosage
  const [patientWeight, setPatientWeight] = useState('')
  const [drugDose, setDrugDose] = useState('')
  const [pediatricResult, setPediatricResult] = useState('')

  const calculatePediatricDose = () => {
    const weight = parseFloat(patientWeight)
    const dose = parseFloat(drugDose)
    if (weight > 0 && dose > 0) {
      const result = (weight * dose).toFixed(2)
      setPediatricResult(`${result} mg`)
    }
  }

  // BMI Calculator
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bmiResult, setBmiResult] = useState('')
  const [bmiCategory, setBmiCategory] = useState('')

  const calculateBMI = () => {
    const h = parseFloat(heightCm) / 100
    const w = parseFloat(weightKg)
    if (h > 0 && w > 0) {
      const bmi = (w / (h * h)).toFixed(2)
      setBmiResult(bmi)
      if (bmi < '18.5') setBmiCategory('Bajo peso')
      else if (bmi < '25') setBmiCategory('Normal')
      else if (bmi < '30') setBmiCategory('Sobrepeso')
      else setBmiCategory('Obeso')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedResult(true)
    setTimeout(() => setCopiedResult(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-teal-600" />
        <h3 className="text-xl font-bold text-slate-900">Calculadoras Clinicas</h3>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'unitConversion', label: 'Conversor de Unidades' },
          { id: 'pediatricDose', label: 'Dosis Pediatricas' },
          { id: 'bmi', label: 'IMC' },
        ].map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeCalc === calc.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            {calc.label}
          </button>
        ))}
      </div>

      {/* Unit Conversion */}
      {activeCalc === 'unitConversion' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Conversor de Unidades</CardTitle>
            <p className="text-xs text-slate-500 mt-1">mg/dL a mmol/l (Glucosa)</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">mg/dL</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Ej: 100"
                    value={mgdlValue}
                    onChange={(e) => handleUnitConversion('mgdl', e.target.value)}
                  />
                  {mgdlValue && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(mgdlValue)}
                      className="h-10 w-10 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">mmol/L</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Ej: 5.5"
                    value={mmolValue}
                    onChange={(e) => handleUnitConversion('mmol', e.target.value)}
                  />
                  {mmolValue && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(mmolValue)}
                      className="h-10 w-10 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
              <p className="text-xs text-teal-700">
                <strong>Formula:</strong> mg/dL ÷ 18.01559 = mmol/L
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pediatric Dosage */}
      {activeCalc === 'pediatricDose' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Dosis Pediatricas</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Calculo de dosis por peso corporal</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
                <Input
                  type="number"
                  placeholder="Ej: 20"
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dosis Unitaria (mg/kg)</label>
                <Input
                  type="number"
                  placeholder="Ej: 10"
                  value={drugDose}
                  onChange={(e) => setDrugDose(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={calculatePediatricDose} className="w-full">
              Calcular Dosis
            </Button>

            {pediatricResult && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Dosis Total:</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white text-base px-3 py-1">
                      {pediatricResult}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(pediatricResult)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Estas calculadoras son de apoyo. Siempre verifica los resultados antes de administrar cualquier medicamento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BMI Calculator */}
      {activeCalc === 'bmi' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Indice de Masa Corporal (IMC)</CardTitle>
            <p className="text-xs text-slate-500 mt-1">BMI = peso(kg) / altura(m)²</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Altura (cm)</label>
                <Input
                  type="number"
                  placeholder="Ej: 170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
                <Input
                  type="number"
                  placeholder="Ej: 70"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={calculateBMI} className="w-full">
              Calcular IMC
            </Button>

            {bmiResult && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">IMC:</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white text-base px-3 py-1">
                        {bmiResult}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bmiResult)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {bmiCategory && (
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <p className="text-sm"><span className="font-medium">Categoria:</span> {bmiCategory}</p>
                    <div className="text-xs text-slate-600 mt-2 space-y-1">
                      <p>Bajo peso: &lt; 18.5</p>
                      <p>Normal: 18.5 - 24.9</p>
                      <p>Sobrepeso: 25 - 29.9</p>
                      <p>Obeso: &geq; 30</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {copiedResult && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
          Copiado al portapapeles
        </div>
      )}
    </div>
  )
}
