import type { TaskCategory, TaskArea, TaskStatus, TaskPriority, AppointmentStatus } from '../../types'

type BadgeVariant =
  | 'categoria'
  | 'area'
  | 'estado'
  | 'prioridad'
  | 'cita'

interface BadgeProps {
  variant: BadgeVariant
  value: TaskCategory | TaskArea | TaskStatus | TaskPriority | AppointmentStatus | string
  className?: string
}

const categoriaMap: Record<TaskCategory, string> = {
  apertura: 'bg-amber-100 text-amber-700',
  cierre: 'bg-slate-100 text-slate-700',
  limpieza: 'bg-blue-100 text-blue-700',
  cabina: 'bg-purple-100 text-purple-700',
  revision: 'bg-teal-100 text-teal-700',
  administrativa: 'bg-orange-100 text-orange-700',
  comercial: 'bg-rose-100 text-rose-700',
}

const categoriaLabel: Record<TaskCategory, string> = {
  apertura: 'Apertura',
  cierre: 'Cierre',
  limpieza: 'Limpieza',
  cabina: 'Cabina',
  revision: 'Revisión',
  administrativa: 'Administrativa',
  comercial: 'Comercial',
}

const areaMap: Record<TaskArea, string> = {
  estetica: 'bg-pink-50 text-pink-600',
  fisioterapia: 'bg-indigo-50 text-indigo-600',
  general: 'bg-stone-100 text-stone-600',
}

const areaLabel: Record<TaskArea, string> = {
  estetica: 'Estética',
  fisioterapia: 'Fisioterapia',
  general: 'General',
}

const prioridadMap: Record<TaskPriority, string> = {
  alta: 'bg-red-50 text-red-600',
  media: 'bg-amber-50 text-amber-600',
  baja: 'bg-stone-50 text-stone-500',
}

const prioridadLabel: Record<TaskPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

const citaMap: Record<AppointmentStatus, string> = {
  proxima: 'bg-emerald-50 text-emerald-700',
  realizada: 'bg-stone-100 text-stone-500',
  cancelada: 'bg-rose-50 text-rose-600',
}

const citaLabel: Record<AppointmentStatus, string> = {
  proxima: 'Próxima',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

export function Badge({ variant, value, className = '' }: BadgeProps) {
  let colorClass = 'bg-stone-100 text-stone-600'
  let label = value

  if (variant === 'categoria') {
    const cat = value as TaskCategory
    colorClass = categoriaMap[cat] ?? colorClass
    label = categoriaLabel[cat] ?? value
  } else if (variant === 'area') {
    const area = value as TaskArea
    colorClass = areaMap[area] ?? colorClass
    label = areaLabel[area] ?? value
  } else if (variant === 'prioridad') {
    const pri = value as TaskPriority
    colorClass = prioridadMap[pri] ?? colorClass
    label = prioridadLabel[pri] ?? value
  } else if (variant === 'cita') {
    const cita = value as AppointmentStatus
    colorClass = citaMap[cita] ?? colorClass
    label = citaLabel[cita] ?? value
  } else if (variant === 'estado') {
    if (value === 'pendiente') {
      colorClass = 'bg-stone-100 text-stone-600'
      label = 'Pendiente'
    } else if (value === 'respondida') {
      colorClass = 'bg-emerald-50 text-emerald-700'
      label = 'Respondida'
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  )
}
