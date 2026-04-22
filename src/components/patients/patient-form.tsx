import React, { useState, useEffect } from 'react'
import type { Patient } from '../../types'
import { Input, Textarea } from '../ui/input'
import { Button } from '../ui/button'

interface PatientFormProps {
  patient?: Patient | null
  onSave: (data: Omit<Patient, 'id'>) => void
  onCancel: () => void
}

interface FormState {
  nombre: string
  telefono: string
  historialResumido: string
}

interface FormErrors {
  nombre?: string
  telefono?: string
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [form, setForm] = useState<FormState>({
    nombre: patient?.nombre ?? '',
    telefono: patient?.telefono ?? '',
    historialResumido: patient?.historialResumido ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (patient) {
      setForm({
        nombre: patient.nombre,
        telefono: patient.telefono,
        historialResumido: patient.historialResumido,
      })
    } else {
      setForm({ nombre: '', telefono: '', historialResumido: '' })
    }
    setErrors({})
  }, [patient])

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      historialResumido: form.historialResumido.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        placeholder="Ana García López"
        value={form.nombre}
        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
        error={errors.nombre}
        autoFocus
      />
      <Input
        label="Teléfono"
        placeholder="612 345 678"
        value={form.telefono}
        onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
        error={errors.telefono}
        type="tel"
      />
      <Textarea
        label="Historial resumido"
        placeholder="Notas sobre tratamientos, alergias, observaciones..."
        value={form.historialResumido}
        onChange={(e) => setForm((f) => ({ ...f, historialResumido: e.target.value }))}
        rows={3}
        hint="Opcional. Información relevante sobre el paciente."
      />
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {patient ? 'Guardar cambios' : 'Añadir paciente'}
        </Button>
      </div>
    </form>
  )
}
