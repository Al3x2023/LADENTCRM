import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Calculator, Info, Copy } from 'lucide-react'
import { cn } from '../ui/Button'

export const ClinicalCalculators = () => {
  const [activeCalc, setActiveCalc] = useState<string>('unitConversion')
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
      if (parseFloat(bmi) < 18.5) setBmiCategory('Bajo peso')
      else if (parseFloat(bmi) < 25) setBmiCategory('Normal')
      else if (parseFloat(bmi) < 30) setBmiCategory('Sobrepeso')
      else setBmiCategory('Obeso')
    }
  }

  // Anesthesia Calculator (Dental specific)
  const [patientWeightAnes, setPatientWeightAnes] = useState('')
  const [anesResult, setAnesResult] = useState('')

  const calculateAnesthesia = (type: string) => {
    const weight = parseFloat(patientWeightAnes)
    if (weight <= 0) return
    let result = 0
    let medication = ''
    if (type === 'lidocaine') {
      result = weight * 4.4
      medication = 'Lidocaina 2% (max 500mg)'
    } else if (type === 'articaine') {
      result = weight * 7
      medication = 'Articaina 4% (max 500mg)'
    }
    const safe = result <= 500 ? '✓ SEGURO' : '⚠ REDUIR DOSIS'
    setAnesResult(`${result.toFixed(2)}mg ${medication} - ${safe}`)
  }

  // Child Age Classification (Dental)
  const [childAge, setChildAge] = useState('')
  const [childClass, setChildClass] = useState('')

  const classifyChild = () => {
    const age = parseInt(childAge)
    let classification = ''
    if (age < 2) classification = 'Infancia Temprana (0-2 años)'
    else if (age < 6) classification = 'Preescolar (3-6 años) - DENTICION MIXTA'
    else if (age < 13) classification = 'Escolar (7-12 años) - DENTICION MIXTA'
    else if (age < 18) classification = 'Adolescente (13-18 años)'
    setChildClass(classification)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedResult(true)
    setTimeout(() => setCopiedResult(false), 2000)
  }

  const explanations: Record<string, { title: string; desc: string; formula: string }> = {
    unitConversion: {
      title: 'Conversor de Glucosa',
      desc: 'Convierte entre unidades de medicion de glucosa. Importante para pacientes diabeticos evaluados antes de procedimientos dentales.',
      formula: 'mg/dL ÷ 18.01559 = mmol/L (o multiplicar para lo inverso)'
    },
    pediatricDose: {
      title: 'Dosis Pediatricas',
      desc: 'Calcula la dosis correcta segun el peso del paciente. Esencial en odontologia pediatrica. Nunca sobrepasar dosis maxima por tipo de medicamento.',
      formula: 'Dosis Total = Peso (kg) × Dosis Unitaria (mg/kg)'
    },
    bmi: {
      title: 'Indice de Masa Corporal',
      desc: 'Eval ua el estado nutricional. Pacientes con BMI extremo pueden requerir consideraciones anestesicas especiales.',
      formula: 'IMC = Peso (kg) ÷ Altura² (m²)'
    },
    anesthesia: {
      title: 'Anestesia Local Dental',
      desc: 'Calcula la dosis maxima segura de anestesicos dentales. Variar segun edad, peso y medicamentos concomitantes.',
      formula: 'Lidocaina 2%: 4.4mg/kg (max 500mg) | Articaina 4%: 7mg/kg (max 500mg)'
    },
    child: {
      title: 'Clasificacion Pediatrica',
      desc: 'Determina la etapa de desarrollo del nino para seleccionar la tecnica clinica apropiada y medicamentos.',
      formula: 'Basado en edad cronologica del paciente'
    }
  }

  const renderExplanation = () => {
    const exp = explanations[activeCalc]
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-blue-900">{exp.title}</p>
            <p className="text-blue-800">{exp.desc}</p>
            <p className="font-mono text-[10px] text-blue-700 bg-white px-2 py-1 rounded">Formula: {exp.formula}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-teal-600" />
        <h3 className="text-xl font-bold text-slate-900">Calculadoras Clinicas Dentales</h3>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'unitConversion', label: 'Glucosa' },
          { id: 'pediatricDose', label: 'Dosis Pediatricas' },
          { id: 'anesthesia', label: 'Anestesia Local' },
          { id: 'child', label: 'Clasificacion Nino' },
          { id: 'bmi', label: 'IMC' },
        ].map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id)}
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
            <CardTitle className="text-lg">Conversor de Unidades - Glucosa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(mgdlValue)} className="h-10 w-10 p-0">
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
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(mmolValue)} className="h-10 w-10 p-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {renderExplanation()}
          </CardContent>
        </Card>
      )}

      {/* Pediatric Dosage */}
      {activeCalc === 'pediatricDose' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Dosis Pediatricas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
                <Input type="number" placeholder="Ej: 20" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dosis Unitaria (mg/kg)</label>
                <Input type="number" placeholder="Ej: 10" value={drugDose} onChange={(e) => setDrugDose(e.target.value)} />
              </div>
            </div>
            <Button onClick={calculatePediatricDose} className="w-full">Calcular Dosis</Button>
            {pediatricResult && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Dosis Total:</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white text-base px-3 py-1">{pediatricResult}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(pediatricResult)} className="h-8 w-8 p-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {renderExplanation()}
          </CardContent>
        </Card>
      )}

      {/* Anesthesia Calculator */}
      {activeCalc === 'anesthesia' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Calculador de Anestesia Local</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Peso del Paciente (kg)</label>
              <Input type="number" placeholder="Ej: 70" value={patientWeightAnes} onChange={(e) => setPatientWeightAnes(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => calculateAnesthesia('lidocaine')} variant="outline">Lidocaina 2%</Button>
              <Button onClick={() => calculateAnesthesia('articaine')} variant="outline">Articaina 4%</Button>
            </div>
            {anesResult && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono text-amber-900">{anesResult}</p>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(anesResult)} className="h-8 w-8 p-0">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {renderExplanation()}
          </CardContent>
        </Card>
      )}

      {/* Child Classification */}
      {activeCalc === 'child' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Clasificacion Pediatrica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Edad del Nino (anos)</label>
              <Input type="number" placeholder="Ej: 8" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
            </div>
            <Button onClick={classifyChild} className="w-full">Clasificar</Button>
            {childClass && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-900">{childClass}</p>
              </div>
            )}
            {renderExplanation()}
          </CardContent>
        </Card>
      )}

      {/* BMI Calculator */}
      {activeCalc === 'bmi' && (
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-lg">Indice de Masa Corporal (IMC)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Altura (cm)</label>
                <Input type="number" placeholder="Ej: 170" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
                <Input type="number" placeholder="Ej: 70" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </div>
            </div>
            <Button onClick={calculateBMI} className="w-full">Calcular IMC</Button>
            {bmiResult && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">IMC:</p>
                    <Badge className="bg-blue-600 text-white">{bmiResult}</Badge>
                  </div>
                </div>
                {bmiCategory && <p className="text-sm font-medium text-slate-700">Categoria: <span className="text-teal-600">{bmiCategory}</span></p>}
              </div>
            )}
            {renderExplanation()}
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
