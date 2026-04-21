import { Edit2, User, Stethoscope } from 'lucide-react'
import type { Appointment } from '../../types'
import { Badge } from '../ui/badge'

interface AppointmentCardProps {
  appointment: Appointment
  onUpdateStatus?: (id: string, status: 'proxima' | 'realizada' | 'cancelada') => void
  onEdit?: (appointment: Appointment) => void
  showDate?: boolean
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return 'Sin registrar'
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return 'Sin registrar'

  return parsed.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AppointmentCard({ appointment, onUpdateStatus, onEdit, showDate = true }: AppointmentCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Left: time + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Time block */}
          <div className="flex-shrink-0 w-14 flex flex-col items-center bg-rose-50 rounded-xl py-2 px-1">
            <span className="text-rose-600 font-bold text-sm leading-none">{appointment.hora}</span>
            {showDate && (
              <span className="text-rose-400 text-xs mt-1 capitalize leading-none">
                {formatDate(appointment.fecha)}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <User size={13} className="text-stone-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-stone-800 truncate">{appointment.pacienteNombre}</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <Stethoscope size={13} className="text-stone-400 flex-shrink-0" />
              <span className="text-xs text-stone-500 truncate">{appointment.tratamiento}</span>
            </div>
            <Badge variant="cita" value={appointment.estado} />
            <div className="mt-3 grid gap-1 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-500">
              <p>
                <span className="font-medium text-stone-600">Creado por:</span>{' '}
                {appointment.createdByLabel || 'Sin registrar'}
              </p>
              <p>
                <span className="font-medium text-stone-600">Ultima actualizacion por:</span>{' '}
                {appointment.updatedByLabel || 'Sin registrar'}
              </p>
              <p>
                <span className="font-medium text-stone-600">Ultima actualizacion:</span>{' '}
                {formatDateTime(appointment.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: quick status actions */}
        {(onUpdateStatus || onEdit) && appointment.estado === 'proxima' && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(appointment)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
              >
                <Edit2 size={12} />
                Editar
              </button>
            )}
            {onUpdateStatus && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'realizada')}
              className="px-2.5 py-2 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Realizada
            </button>
            )}
            {onUpdateStatus && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'cancelada')}
              className="px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Cancelar
            </button>
            )}
          </div>
        )}

        {(onUpdateStatus || onEdit) && appointment.estado !== 'proxima' && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(appointment)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
              >
                <Edit2 size={12} />
                Editar
              </button>
            )}
            {onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(appointment.id, 'proxima')}
                className="px-2.5 py-2 rounded-lg text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors"
              >
                Restablecer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
