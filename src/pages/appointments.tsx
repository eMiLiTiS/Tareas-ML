import { useMemo, useState } from 'react'
import { Calendar, CalendarX, Plus } from 'lucide-react'
import type { Appointment } from '../types'
import { useAppointments } from '../hooks/use-appointments'
import { usePatients } from '../hooks/use-patients'
import { AppointmentCard } from '../components/appointments/appointment-card'
import { AppointmentForm } from '../components/appointments/appointment-form'
import { Modal } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { formatLocalDateKey, parseDateKey, shiftDateKey } from '../utils/date'

type ApptFilter = 'todas' | 'proxima' | 'realizada' | 'cancelada'

const filterOptions: { value: ApptFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'proxima', label: 'Proximas' },
  { value: 'realizada', label: 'Realizadas' },
  { value: 'cancelada', label: 'Canceladas' },
]

function formatDateGroup(dateStr: string): string {
  const today = formatLocalDateKey()
  const tomorrow = shiftDateKey(today, 1)

  if (dateStr === today) return 'Hoy'
  if (dateStr === tomorrow) return 'Manana'

  return parseDateKey(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function Appointments() {
  const { appointments, updateStatus, addAppointment, updateAppointment } = useAppointments()
  const { patients } = usePatients()
  const [activeFilter, setActiveFilter] = useState<ApptFilter>('todas')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const filtered = useMemo(() => {
    const base =
      activeFilter === 'todas'
        ? [...appointments]
        : appointments.filter((appointment) => appointment.estado === activeFilter)

    return base.sort((left, right) => {
      const leftDate = `${left.fecha}T${left.hora}`
      const rightDate = `${right.fecha}T${right.hora}`
      return leftDate.localeCompare(rightDate)
    })
  }, [appointments, activeFilter])

  const grouped = useMemo(() => {
    const groupedAppointments = new Map<string, typeof filtered>()
    for (const appointment of filtered) {
      const current = groupedAppointments.get(appointment.fecha)
      if (current) {
        current.push(appointment)
      } else {
        groupedAppointments.set(appointment.fecha, [appointment])
      }
    }
    return groupedAppointments
  }, [filtered])

  const counts = useMemo(
    () => ({
      todas: appointments.length,
      proxima: appointments.filter((appointment) => appointment.estado === 'proxima').length,
      realizada: appointments.filter((appointment) => appointment.estado === 'realizada').length,
      cancelada: appointments.filter((appointment) => appointment.estado === 'cancelada').length,
    }),
    [appointments]
  )

  function handleOpenCreate() {
    setEditingAppointment(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(appointment: Appointment) {
    setEditingAppointment(appointment)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingAppointment(null)
  }

  function handleSaveAppointment(
    data: Omit<Appointment, 'id' | 'createdBy' | 'updatedBy' | 'createdByLabel' | 'updatedByLabel' | 'createdAt' | 'updatedAt'>
  ) {
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, data)
    } else {
      addAppointment(data)
    }
    handleCloseForm()
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Citas</h1>
          <p className="mt-1 text-sm text-stone-500">Proximas citas, historico y gestion completa desde la app</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreate} disabled={patients.length === 0}>
          <Plus size={16} />
          Nueva cita
        </Button>
      </div>

      {patients.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Necesitas al menos un paciente para crear citas.
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Proximas', value: counts.proxima, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Realizadas', value: counts.realizada, color: 'bg-stone-50 text-stone-500' },
          { label: 'Canceladas', value: counts.cancelada, color: 'bg-rose-50 text-rose-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-2.5 text-center`}>
            <div className="text-xl font-bold leading-none">{value}</div>
            <div className="mt-1 text-xs font-medium opacity-80">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {filterOptions.map(({ value, label }) => {
          const isActive = activeFilter === value
          const count = counts[value]

          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={[
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50',
              ].join(' ')}
            >
              {label}
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            <CalendarX size={28} className="text-stone-400" />
          </div>
          <p className="font-medium text-stone-600">No hay citas</p>
          <p className="mt-1 text-sm text-stone-400">No se encontraron citas con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Array.from(grouped.entries()).map(([date, groupedAppointments]) => (
            <div key={date}>
              <div className="mb-3 flex items-center gap-2">
                <Calendar size={14} className="text-stone-400" />
                <h3 className="text-sm font-semibold capitalize text-stone-700">{formatDateGroup(date)}</h3>
                <span className="text-xs text-stone-400">- {date}</span>
              </div>
              <div className="flex flex-col gap-2">
                {groupedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onUpdateStatus={updateStatus}
                    onEdit={handleOpenEdit}
                    showDate={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingAppointment ? 'Editar cita' : 'Nueva cita'}
        size="md"
      >
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          onSave={handleSaveAppointment}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  )
}
