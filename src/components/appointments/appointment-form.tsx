import React, { useEffect, useMemo, useState } from 'react'
import type { Appointment, AppointmentStatus, Patient } from '../../types'
import { Input, Select } from '../ui/input'
import { Button } from '../ui/button'

type AppointmentFormValues = {
  pacienteId: string
  tratamiento: string
  fecha: string
  hora: string
  estado: AppointmentStatus
}

interface AppointmentFormProps {
  appointment?: Appointment | null
  patients: Patient[]
  onSave: (data: Omit<Appointment, 'id' | 'createdBy' | 'updatedBy' | 'createdByLabel' | 'updatedByLabel' | 'createdAt' | 'updatedAt' | 'pacienteNombre'> & {
    pacienteNombre: string
  }) => void
  onCancel: () => void
}

interface FormErrors {
  pacienteId?: string
  tratamiento?: string
  fecha?: string
  hora?: string
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'proxima', label: 'Proxima' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export function AppointmentForm({ appointment, patients, onSave, onCancel }: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormValues>({
    pacienteId: appointment?.pacienteId ?? '',
    tratamiento: appointment?.tratamiento ?? '',
    fecha: appointment?.fecha ?? '',
    hora: appointment?.hora ?? '',
    estado: appointment?.estado ?? 'proxima',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    setForm({
      pacienteId: appointment?.pacienteId ?? '',
      tratamiento: appointment?.tratamiento ?? '',
      fecha: appointment?.fecha ?? '',
      hora: appointment?.hora ?? '',
      estado: appointment?.estado ?? 'proxima',
    })
    setErrors({})
  }, [appointment])

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        value: patient.id,
        label: patient.nombre,
      })),
    [patients]
  )

  function validate() {
    const nextErrors: FormErrors = {}

    if (!form.pacienteId) nextErrors.pacienteId = 'Selecciona un paciente'
    if (!form.tratamiento.trim()) nextErrors.tratamiento = 'El tratamiento es obligatorio'
    if (!form.fecha) nextErrors.fecha = 'La fecha es obligatoria'
    if (!form.hora) nextErrors.hora = 'La hora es obligatoria'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

    const patient = patients.find((item) => item.id === form.pacienteId)
    if (!patient) {
      setErrors({ pacienteId: 'Selecciona un paciente valido' })
      return
    }

    onSave({
      pacienteId: patient.id,
      pacienteNombre: patient.nombre,
      tratamiento: form.tratamiento.trim(),
      fecha: form.fecha,
      hora: form.hora,
      estado: form.estado,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Paciente"
        value={form.pacienteId}
        onChange={(event) => setForm((current) => ({ ...current, pacienteId: event.target.value }))}
        options={[{ value: '', label: 'Selecciona un paciente' }, ...patientOptions]}
        error={errors.pacienteId}
      />
      <Input
        label="Tratamiento"
        placeholder="Ej: Sesion de fisioterapia"
        value={form.tratamiento}
        onChange={(event) => setForm((current) => ({ ...current, tratamiento: event.target.value }))}
        error={errors.tratamiento}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha"
          type="date"
          value={form.fecha}
          onChange={(event) => setForm((current) => ({ ...current, fecha: event.target.value }))}
          error={errors.fecha}
        />
        <Input
          label="Hora"
          type="time"
          value={form.hora}
          onChange={(event) => setForm((current) => ({ ...current, hora: event.target.value }))}
          error={errors.hora}
        />
      </div>
      <Select
        label="Estado"
        value={form.estado}
        onChange={(event) =>
          setForm((current) => ({ ...current, estado: event.target.value as AppointmentStatus }))
        }
        options={statusOptions}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {appointment ? 'Guardar cambios' : 'Crear cita'}
        </Button>
      </div>
    </form>
  )
}
