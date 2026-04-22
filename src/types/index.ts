export type TaskCategory = 'apertura' | 'cierre' | 'limpieza' | 'cabina' | 'revision' | 'administrativa' | 'comercial'
export type TaskArea = 'estetica' | 'fisioterapia' | 'general'
export type TaskResponseType = 'boolean' | 'number'
export type TaskStatus = 'pendiente' | 'respondida'
export type TaskPriority = 'alta' | 'media' | 'baja'
export type AppointmentStatus = 'proxima' | 'realizada' | 'cancelada'
export type Page = 'dashboard' | 'tareas' | 'pacientes' | 'citas' | 'configuracion' | 'checklist' | 'resumen' | 'actividad-semanal'
export type ChecklistTipo = 'apertura' | 'durante_dia' | 'cierre' | 'semanal'

export interface ChecklistTemplate {
  id: string
  tipo: ChecklistTipo
  categoria: string
  titulo: string
  orden: number
  activa: boolean
}

export interface ChecklistCompletion {
  id: string
  clinicId: string
  templateId: string
  fecha?: string
  semana?: number
  año?: number
  completadoPor?: string
  completadoEn?: string
  completadoPorNombre?: string
  notas?: string
  cantidad?: number | null
}

export interface Clinic {
  id: string
  nombre: string
  accessCode: string
}

export interface Task {
  id: string
  clinicId?: string | null
  titulo: string
  descripcion?: string
  categoria: TaskCategory
  area: TaskArea
  tipoRespuesta: TaskResponseType
  valorRespuesta?: boolean | number | null
  estado: TaskStatus
  prioridad: TaskPriority
  fecha: string
  pacienteId?: string | null
  tratamiento?: string | null
}

export interface Patient {
  id: string
  clinicId?: string | null
  nombre: string
  telefono: string
  historialResumido: string
}

export interface Appointment {
  id: string
  clinicId?: string | null
  pacienteId: string
  pacienteNombre: string
  tratamiento: string
  fecha: string
  hora: string
  estado: AppointmentStatus
  createdBy?: string | null
  updatedBy?: string | null
  createdByLabel?: string
  updatedByLabel?: string
  createdAt?: string
  updatedAt?: string
}

export interface TaskTemplate {
  id: string
  clinicId?: string | null
  titulo: string
  descripcion?: string
  categoria: TaskCategory
  area: TaskArea
  tipoRespuesta: TaskResponseType
  prioridad: TaskPriority
  activa: boolean
}

export interface WorkerProfile {
  id: string
  clinicId: string
  email: string
  nombre: string
  puesto: string
  telefono: string
  notas: string
  clinicName: string
  clinicAccessCode: string
}
