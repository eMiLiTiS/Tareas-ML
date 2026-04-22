import type { Appointment, Patient, Task, TaskTemplate } from '../types'
import { defaultAppointments, defaultPatients, defaultTemplates, generateDailyTasks } from '../data/seed'
import { getItem, removeItem, setItem } from '../utils/storage'
import { getCurrentClinicId, isSupabaseConfigured, supabase } from './supabase'

const STORAGE_KEYS = {
  patients: 'eml_patients',
  appointments: 'eml_appointments',
  templates: 'eml_templates',
}

function scopedStorageKey(key: string) {
  return `${key}_${getCurrentClinicId() ?? 'local'}`
}

function taskStorageKey(date: string) {
  return scopedStorageKey(`eml_tasks_${date}`)
}

export function patientStorageKey() {
  return scopedStorageKey(STORAGE_KEYS.patients)
}

export function templateStorageKey() {
  return scopedStorageKey(STORAGE_KEYS.templates)
}

export function dailyTaskStorageKey(date: string) {
  return taskStorageKey(date)
}

type PatientRow = {
  id: string
  clinic_id: string
  nombre: string
  telefono: string
  historial_resumido: string
}

type AppointmentRow = {
  id: string
  clinic_id: string
  paciente_id: string
  paciente_nombre: string
  tratamiento: string
  fecha: string
  hora: string
  estado: Appointment['estado']
  created_by: string | null
  updated_by: string | null
  created_at: string | null
  updated_at: string | null
}

type WorkerProfileLookupRow = {
  id: string
  email: string
  nombre: string | null
}

type TaskTemplateRow = {
  id: string
  clinic_id: string
  titulo: string
  descripcion: string | null
  categoria: TaskTemplate['categoria']
  area: TaskTemplate['area']
  tipo_respuesta: TaskTemplate['tipoRespuesta']
  prioridad: TaskTemplate['prioridad']
  activa: boolean
}

type TaskRow = {
  id: string
  clinic_id: string
  titulo: string
  descripcion: string | null
  categoria: Task['categoria']
  area: Task['area']
  tipo_respuesta: Task['tipoRespuesta']
  valor_respuesta: boolean | number | null
  estado: Task['estado']
  prioridad: Task['prioridad']
  fecha: string
  paciente_id: string | null
  tratamiento: string | null
}

type RowWithId = {
  id: string
}

type SyncFilter = {
  column: string
  value: string
}

function toPatientRow(patient: Patient): PatientRow {
  const clinicId = patient.clinicId ?? getCurrentClinicId()
  if (!clinicId) {
    throw new Error('clinic_id is required to save patients')
  }

  return {
    id: patient.id,
    clinic_id: clinicId,
    nombre: patient.nombre,
    telefono: patient.telefono,
    historial_resumido: patient.historialResumido,
  }
}

function fromPatientRow(row: PatientRow): Patient {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    nombre: row.nombre,
    telefono: row.telefono,
    historialResumido: row.historial_resumido,
  }
}

function toAppointmentRow(appointment: Appointment): AppointmentRow {
  const clinicId = appointment.clinicId ?? getCurrentClinicId()
  if (!clinicId) {
    throw new Error('clinic_id is required to save appointments')
  }

  return {
    id: appointment.id,
    clinic_id: clinicId,
    paciente_id: appointment.pacienteId,
    paciente_nombre: appointment.pacienteNombre,
    tratamiento: appointment.tratamiento,
    fecha: appointment.fecha,
    hora: appointment.hora,
    estado: appointment.estado,
    created_by: appointment.createdBy ?? null,
    updated_by: appointment.updatedBy ?? null,
    created_at: appointment.createdAt ?? null,
    updated_at: appointment.updatedAt ?? null,
  }
}

function fromAppointmentRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    pacienteId: row.paciente_id,
    pacienteNombre: row.paciente_nombre,
    tratamiento: row.tratamiento,
    fecha: row.fecha,
    hora: row.hora,
    estado: row.estado,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdByLabel: row.created_by ? 'Sin registrar' : undefined,
    updatedByLabel: row.updated_by ? 'Sin registrar' : undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

function resolveAuditLabel(
  actorId: string | null | undefined,
  lookup: Map<string, string>
): string {
  if (!actorId) return 'Sin registrar'
  return lookup.get(actorId) ?? 'Sin registrar'
}

async function enrichAppointmentsWithProfiles(appointments: Appointment[]) {
  if (!isSupabaseConfigured || !supabase || appointments.length === 0) {
    return appointments.map((appointment) => ({
      ...appointment,
      createdByLabel: appointment.createdByLabel ?? (appointment.createdBy ? 'Sin registrar' : 'Sin registrar'),
      updatedByLabel: appointment.updatedByLabel ?? (appointment.updatedBy ? 'Sin registrar' : 'Sin registrar'),
    }))
  }

  const actorIds = Array.from(
    new Set(
      appointments
        .flatMap((appointment) => [appointment.createdBy, appointment.updatedBy])
        .filter((value): value is string => Boolean(value))
    )
  )

  if (actorIds.length === 0) {
    return appointments.map((appointment) => ({
      ...appointment,
      createdByLabel: 'Sin registrar',
      updatedByLabel: 'Sin registrar',
    }))
  }

  const { data, error } = await supabase
    .from('worker_profiles')
    .select('id,email,nombre')
    .in('id', actorIds)

  if (error) {
    console.error('Error loading worker profiles for appointments', error)
    return appointments.map((appointment) => ({
      ...appointment,
      createdByLabel: appointment.createdBy ? 'Sin registrar' : 'Sin registrar',
      updatedByLabel: appointment.updatedBy ? 'Sin registrar' : 'Sin registrar',
    }))
  }

  const lookup = new Map<string, string>()
  for (const row of (data ?? []) as WorkerProfileLookupRow[]) {
    lookup.set(row.id, row.nombre?.trim() || row.email || 'Sin registrar')
  }

  return appointments.map((appointment) => ({
    ...appointment,
    createdByLabel: resolveAuditLabel(appointment.createdBy, lookup),
    updatedByLabel: resolveAuditLabel(appointment.updatedBy, lookup),
  }))
}

function toTaskTemplateRow(template: TaskTemplate): TaskTemplateRow {
  const clinicId = template.clinicId ?? getCurrentClinicId()
  if (!clinicId) {
    throw new Error('clinic_id is required to save task templates')
  }

  return {
    id: template.id,
    clinic_id: clinicId,
    titulo: template.titulo,
    descripcion: template.descripcion ?? null,
    categoria: template.categoria,
    area: template.area,
    tipo_respuesta: template.tipoRespuesta,
    prioridad: template.prioridad,
    activa: template.activa,
  }
}

function fromTaskTemplateRow(row: TaskTemplateRow): TaskTemplate {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? undefined,
    categoria: row.categoria,
    area: row.area,
    tipoRespuesta: row.tipo_respuesta,
    prioridad: row.prioridad,
    activa: row.activa,
  }
}

function toTaskRow(task: Task): TaskRow {
  const clinicId = task.clinicId ?? getCurrentClinicId()
  if (!clinicId) {
    throw new Error('clinic_id is required to save tasks')
  }

  return {
    id: task.id,
    clinic_id: clinicId,
    titulo: task.titulo,
    descripcion: task.descripcion ?? null,
    categoria: task.categoria,
    area: task.area,
    tipo_respuesta: task.tipoRespuesta,
    valor_respuesta: task.valorRespuesta ?? null,
    estado: task.estado,
    prioridad: task.prioridad,
    fecha: task.fecha,
    paciente_id: task.pacienteId ?? null,
    tratamiento: task.tratamiento ?? null,
  }
}

function fromTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? undefined,
    categoria: row.categoria,
    area: row.area,
    tipoRespuesta: row.tipo_respuesta,
    valorRespuesta: row.valor_respuesta,
    estado: row.estado,
    prioridad: row.prioridad,
    fecha: row.fecha,
    pacienteId: row.paciente_id,
    tratamiento: row.tratamiento,
  }
}

async function syncRowsById<TRow extends RowWithId>(
  table: string,
  rows: TRow[],
  filters: SyncFilter[] = []
) {
  if (!isSupabaseConfigured || !supabase) return

  let selectQuery = supabase.from(table).select('id')
  for (const filter of filters) {
    selectQuery = selectQuery.eq(filter.column, filter.value)
  }

  const { data: remoteRows, error: loadError } = await selectQuery
  if (loadError) {
    console.error(`Error loading ${table} ids from Supabase`, loadError)
    return
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
    if (upsertError) {
      console.error(`Error saving ${table} to Supabase`, upsertError)
      return
    }
  }

  const nextIds = new Set(rows.map((row) => row.id))
  const idsToDelete = (remoteRows ?? [])
    .map((row) => row.id as string)
    .filter((id) => !nextIds.has(id))

  if (idsToDelete.length === 0) return

  let deleteQuery = supabase.from(table).delete().in('id', idsToDelete)
  for (const filter of filters) {
    deleteQuery = deleteQuery.eq(filter.column, filter.value)
  }

  const { error: deleteError } = await deleteQuery
  if (deleteError) {
    console.error(`Error deleting stale ${table} rows from Supabase`, deleteError)
  }
}

function updateLocalCollection<TItem>(storageKey: string, fallback: TItem[], updater: (items: TItem[]) => TItem[]) {
  const current = getItem<TItem[]>(storageKey, fallback)
  const next = updater(current)
  setItem(storageKey, next)
  return next
}

async function bootstrapCollection<TItem, TRow>(options: {
  storageKey: string
  table: string
  seed: TItem[]
  toRow: (item: TItem) => TRow
  fromRow: (row: TRow) => TItem
  orderBy?: string
}): Promise<TItem[]> {
  const localData = getItem<TItem[]>(options.storageKey, options.seed)

  if (!isSupabaseConfigured || !supabase) {
    return localData
  }

  const clinicId = getCurrentClinicId()
  if (!clinicId) {
    return localData
  }

  const query = supabase.from(options.table).select('*').eq('clinic_id', clinicId)
  const orderedQuery = options.orderBy ? query.order(options.orderBy) : query
  const { data, error } = await orderedQuery

  if (error) {
    console.error(`Error loading ${options.table} from Supabase`, error)
    return localData
  }

  if (data && data.length > 0) {
    const normalized = (data as TRow[]).map(options.fromRow)
    setItem(options.storageKey, normalized)
    return normalized
  }

  if (localData.length > 0) {
    const { error: insertError } = await supabase
      .from(options.table)
      .upsert(localData.map(options.toRow), { onConflict: 'id' })

    if (insertError) {
      console.error(`Error seeding ${options.table} in Supabase`, insertError)
    }
  }

  return localData
}

export const patientStore = {
  load: () =>
    bootstrapCollection<Patient, PatientRow>({
      storageKey: scopedStorageKey(STORAGE_KEYS.patients),
      table: 'patients',
      seed: defaultPatients,
      toRow: toPatientRow,
      fromRow: fromPatientRow,
      orderBy: 'nombre',
    }),
  async saveAll(patients: Patient[]) {
    setItem(scopedStorageKey(STORAGE_KEYS.patients), patients)
    if (!isSupabaseConfigured || !supabase) return
    const clinicId = getCurrentClinicId()
    if (!clinicId) return
    await syncRowsById('patients', patients.map(toPatientRow), [{ column: 'clinic_id', value: clinicId }])
  },
  async create(patient: Patient) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.patients), defaultPatients, (patients) => [...patients, patient])
    if (!isSupabaseConfigured || !supabase) return

    const { error } = await supabase.from('patients').upsert([toPatientRow(patient)], { onConflict: 'id' })
    if (error) {
      console.error('Error creating patient in Supabase', error)
    }
  },
  async update(id: string, updates: Omit<Patient, 'id'>) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.patients), defaultPatients, (patients) =>
      patients.map((patient) => (patient.id === id ? { ...patient, ...updates } : patient))
    )
    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    if (!clinicId) return

    const { error } = await supabase
      .from('patients')
      .update(toPatientRow({ id, clinicId, ...updates }))
      .eq('id', id)
      .eq('clinic_id', clinicId)
    if (error) {
      console.error('Error updating patient in Supabase', error)
    }
  },
  async delete(id: string) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.patients), defaultPatients, (patients) =>
      patients.filter((patient) => patient.id !== id)
    )
    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    if (!clinicId) return

    const { error } = await supabase.from('patients').delete().eq('id', id).eq('clinic_id', clinicId)
    if (error) {
      console.error('Error deleting patient in Supabase', error)
    }
  },
}

export const appointmentStore = {
  load: async () => {
    const loaded = await bootstrapCollection<Appointment, AppointmentRow>({
      storageKey: scopedStorageKey(STORAGE_KEYS.appointments),
      table: 'appointments',
      seed: defaultAppointments,
      toRow: toAppointmentRow,
      fromRow: fromAppointmentRow,
      orderBy: 'fecha',
    })

    const enriched = await enrichAppointmentsWithProfiles(loaded)
    setItem(scopedStorageKey(STORAGE_KEYS.appointments), enriched)
    return enriched
  },
  async saveAll(appointments: Appointment[]) {
    setItem(scopedStorageKey(STORAGE_KEYS.appointments), appointments)
    if (!isSupabaseConfigured || !supabase) return
    const clinicId = getCurrentClinicId()
    if (!clinicId) return
    await syncRowsById('appointments', appointments.map(toAppointmentRow), [{ column: 'clinic_id', value: clinicId }])
  },
  async create(appointment: Appointment) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.appointments), defaultAppointments, (appointments) => [...appointments, appointment])
    if (!isSupabaseConfigured || !supabase) return

    const { error } = await supabase.from('appointments').upsert([toAppointmentRow(appointment)], { onConflict: 'id' })
    if (error) {
      console.error('Error creating appointment in Supabase', error)
    }
  },
  async update(id: string, updates: Partial<Omit<Appointment, 'id'>>) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.appointments), defaultAppointments, (appointments) =>
      appointments.map((appointment) => (appointment.id === id ? { ...appointment, ...updates } : appointment))
    )
    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    const current = getItem<Appointment[]>(scopedStorageKey(STORAGE_KEYS.appointments), defaultAppointments).find((appointment) => appointment.id === id)
    if (!current) return
    if (!clinicId) return

    const { error } = await supabase
      .from('appointments')
      .update(toAppointmentRow({ ...current, clinicId }))
      .eq('id', id)
      .eq('clinic_id', clinicId)
    if (error) {
      console.error('Error updating appointment in Supabase', error)
    }
  },
  async delete(id: string) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.appointments), defaultAppointments, (appointments) =>
      appointments.filter((appointment) => appointment.id !== id)
    )
    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    if (!clinicId) return

    const { error } = await supabase.from('appointments').delete().eq('id', id).eq('clinic_id', clinicId)
    if (error) {
      console.error('Error deleting appointment in Supabase', error)
    }
  },
}

export const templateStore = {
  load: () =>
    bootstrapCollection<TaskTemplate, TaskTemplateRow>({
      storageKey: scopedStorageKey(STORAGE_KEYS.templates),
      table: 'task_templates',
      seed: defaultTemplates,
      toRow: toTaskTemplateRow,
      fromRow: fromTaskTemplateRow,
      orderBy: 'titulo',
    }),
  async saveAll(templates: TaskTemplate[]) {
    setItem(scopedStorageKey(STORAGE_KEYS.templates), templates)
    if (!isSupabaseConfigured || !supabase) return
    const clinicId = getCurrentClinicId()
    if (!clinicId) return
    await syncRowsById('task_templates', templates.map(toTaskTemplateRow), [{ column: 'clinic_id', value: clinicId }])
  },
  async create(template: TaskTemplate) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.templates), defaultTemplates, (templates) => [...templates, template])
    if (!isSupabaseConfigured || !supabase) return

    const { error } = await supabase.from('task_templates').upsert([toTaskTemplateRow(template)], { onConflict: 'id' })
    if (error) {
      console.error('Error creating task template in Supabase', error)
    }
  },
  async update(id: string, updates: Partial<Omit<TaskTemplate, 'id'>>) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.templates), defaultTemplates, (templates) =>
      templates.map((template) => (template.id === id ? { ...template, ...updates } : template))
    )
    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    const current = getItem<TaskTemplate[]>(scopedStorageKey(STORAGE_KEYS.templates), defaultTemplates).find((template) => template.id === id)
    if (!current) return
    if (!clinicId) return

    const { error } = await supabase
      .from('task_templates')
      .update(toTaskTemplateRow({ ...current, clinicId }))
      .eq('id', id)
      .eq('clinic_id', clinicId)
    if (error) {
      console.error('Error updating task template in Supabase', error)
    }
  },
  async delete(id: string) {
    updateLocalCollection(scopedStorageKey(STORAGE_KEYS.templates), defaultTemplates, (templates) =>
      templates.filter((template) => template.id !== id)
    )
    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    if (!clinicId) return

    const { error } = await supabase.from('task_templates').delete().eq('id', id).eq('clinic_id', clinicId)
    if (error) {
      console.error('Error deleting task template in Supabase', error)
    }
  },
}

export const taskStore = {
  async load(date: string) {
    const localTasks = getItem<Task[] | null>(taskStorageKey(date), null)

    if (!isSupabaseConfigured || !supabase) {
      if (localTasks && localTasks.length > 0) return localTasks

      const templates = getItem(scopedStorageKey(STORAGE_KEYS.templates), defaultTemplates)
      const generated = generateDailyTasks(date, templates)
      setItem(taskStorageKey(date), generated)
      return generated
    }

    const clinicId = getCurrentClinicId()
    if (!clinicId) {
      return localTasks ?? []
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('fecha', date)
      .order('titulo')

    if (error) {
      console.error(`Error loading tasks for ${date} from Supabase`, error)
      if (localTasks && localTasks.length > 0) return localTasks
    }

    if (data && data.length > 0) {
      const remoteTasks = (data as TaskRow[]).map(fromTaskRow)
      setItem(taskStorageKey(date), remoteTasks)
      return remoteTasks
    }

    const templates = await templateStore.load()
    const seedTasks = localTasks && localTasks.length > 0 ? localTasks : generateDailyTasks(date, templates)

    if (seedTasks.length > 0) {
      await syncRowsById('tasks', seedTasks.map(toTaskRow), [
        { column: 'clinic_id', value: clinicId },
        { column: 'fecha', value: date },
      ])
    }

    setItem(taskStorageKey(date), seedTasks)
    return seedTasks
  },
  async saveAll(date: string, tasks: Task[]) {
    const storageKey = taskStorageKey(date)

    if (tasks.length === 0) {
      removeItem(storageKey)
    } else {
      setItem(storageKey, tasks)
    }

    if (!isSupabaseConfigured || !supabase) return

    const clinicId = getCurrentClinicId()
    if (!clinicId) return

    await syncRowsById('tasks', tasks.map(toTaskRow), [
      { column: 'clinic_id', value: clinicId },
      { column: 'fecha', value: date },
    ])
  },
}
