import type { ChecklistCompletion, ChecklistTemplate } from '../types'
import { defaultChecklistTemplates } from '../data/checklist-seed'
import { getItem, setItem } from '../utils/storage'
import { getCurrentClinicId, isSupabaseConfigured, supabase } from './supabase'

export function getWeekKey(año: number, semana: number) {
  return `week_${año}_${String(semana).padStart(2, '0')}`
}

function completionStorageKey(key: string) {
  return `eml_checklist_${key}_${getCurrentClinicId() ?? 'local'}`
}

type ChecklistCompletionRow = {
  id: string
  clinic_id: string
  template_id: string
  fecha: string | null
  semana: number | null
  año: number | null
  completado_por: string | null
  completado_en: string | null
  notas: string | null
}

function toRow(c: ChecklistCompletion): ChecklistCompletionRow {
  return {
    id: c.id,
    clinic_id: c.clinicId,
    template_id: c.templateId,
    fecha: c.fecha ?? null,
    semana: c.semana ?? null,
    año: c.año ?? null,
    completado_por: c.completadoPor ?? null,
    completado_en: c.completadoEn ?? null,
    notas: c.notas ?? null,
  }
}

function fromRow(row: ChecklistCompletionRow): ChecklistCompletion {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    templateId: row.template_id,
    fecha: row.fecha ?? undefined,
    semana: row.semana ?? undefined,
    año: row.año ?? undefined,
    completadoPor: row.completado_por ?? undefined,
    completadoEn: row.completado_en ?? undefined,
    notas: row.notas ?? undefined,
  }
}

export const checklistTemplateStore = {
  load(): ChecklistTemplate[] {
    return defaultChecklistTemplates.filter((t) => t.activa)
  },
}

export const checklistCompletionStore = {
  async load(
    key: string,
    filters: { fecha?: string; semana?: number; año?: number }
  ): Promise<ChecklistCompletion[]> {
    const storageKey = completionStorageKey(key)
    const local = getItem<ChecklistCompletion[]>(storageKey, [])

    if (!isSupabaseConfigured || !supabase) return local

    const clinicId = getCurrentClinicId()
    if (!clinicId) return local

    let query = supabase.from('checklist_completions').select('*').eq('clinic_id', clinicId)

    if (filters.fecha) {
      query = query.eq('fecha', filters.fecha)
    } else if (filters.semana !== undefined && filters.año !== undefined) {
      query = query.eq('semana', filters.semana).eq('año', filters.año)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error loading checklist completions', error)
      return local
    }

    if (data && data.length > 0) {
      const normalized = (data as ChecklistCompletionRow[]).map(fromRow)
      setItem(storageKey, normalized)
      return normalized
    }

    if (local.length > 0) {
      const { error: upsertError } = await supabase
        .from('checklist_completions')
        .upsert(local.map(toRow), { onConflict: 'id' })
      if (upsertError) console.error('Error seeding checklist completions', upsertError)
    }

    return local
  },

  async toggle(
    key: string,
    templateId: string,
    filters: { fecha?: string; semana?: number; año?: number },
    userId?: string
  ): Promise<ChecklistCompletion[]> {
    const storageKey = completionStorageKey(key)
    const clinicId = getCurrentClinicId() ?? 'local'
    const current = getItem<ChecklistCompletion[]>(storageKey, [])

    const existingIdx = current.findIndex((c) => c.templateId === templateId)

    if (existingIdx >= 0) {
      const removed = current[existingIdx]
      const next = current.filter((_, i) => i !== existingIdx)
      setItem(storageKey, next)

      if (isSupabaseConfigured && supabase && clinicId !== 'local') {
        await supabase.from('checklist_completions').delete().eq('id', removed.id)
      }

      return next
    }

    const newCompletion: ChecklistCompletion = {
      id: crypto.randomUUID(),
      clinicId,
      templateId,
      completadoPor: userId,
      completadoEn: new Date().toISOString(),
      ...filters,
    }
    const next = [...current, newCompletion]
    setItem(storageKey, next)

    if (isSupabaseConfigured && supabase && clinicId !== 'local') {
      const { error } = await supabase
        .from('checklist_completions')
        .upsert([toRow(newCompletion)], { onConflict: 'id' })
      if (error) console.error('Error saving checklist completion', error)
    }

    return next
  },
}
