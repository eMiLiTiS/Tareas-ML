import type { ChecklistCompletion, ChecklistTemplate } from '../types'
import { defaultChecklistTemplates } from '../data/checklist-seed'
import { getItem, setItem } from '../utils/storage'
import { getCurrentClinicId, isSupabaseConfigured, supabase } from './supabase'
import { getISOWeek } from '../utils/date'

// Bump version when cache structure changes to avoid parsing old format
const TEMPLATE_CACHE_KEY = 'eml_checklist_templates_v2'
// Templates change rarely; 24 h TTL balances freshness vs. network calls
const TEMPLATE_CACHE_TTL = 24 * 60 * 60 * 1000

type TemplateCacheEntry = {
  data: ChecklistTemplate[]
  cachedAt: number
}

type ChecklistTemplateRow = {
  id: string
  tipo: string
  categoria: string
  titulo: string
  orden: number
  activa: boolean
}

function toTemplateRow(t: ChecklistTemplate): ChecklistTemplateRow {
  return { id: t.id, tipo: t.tipo, categoria: t.categoria, titulo: t.titulo, orden: t.orden, activa: t.activa }
}

function fromTemplateRow(row: ChecklistTemplateRow): ChecklistTemplate {
  return {
    id: row.id,
    tipo: row.tipo as ChecklistTemplate['tipo'],
    categoria: row.categoria,
    titulo: row.titulo,
    orden: row.orden,
    activa: row.activa,
  }
}

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
  completado_por_nombre: string | null
  notas: string | null
  cantidad: number | null
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
    completado_por_nombre: c.completadoPorNombre ?? null,
    notas: c.notas ?? null,
    cantidad: c.cantidad ?? null,
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
    completadoPorNombre: row.completado_por_nombre ?? undefined,
    notas: row.notas ?? undefined,
    cantidad: row.cantidad ?? undefined,
  }
}

/** Clears the template cache so the next loadAsync fetches from Supabase. */
export function invalidateTemplateCache() {
  localStorage.removeItem(TEMPLATE_CACHE_KEY)
}

export const checklistTemplateStore = {
  /** Synchronous load from local seed (used as fallback). */
  load(): ChecklistTemplate[] {
    return defaultChecklistTemplates.filter((t) => t.activa)
  },

  /** Async load: fresh cache → skip network. Expired → fetch Supabase.
   *  On error: stale cache preferred over seed (may have clinic custom templates). */
  async loadAsync(): Promise<ChecklistTemplate[]> {
    const fallback = defaultChecklistTemplates.filter((t) => t.activa)
    const cached = getItem<TemplateCacheEntry | null>(TEMPLATE_CACHE_KEY, null)

    // Fresh cache — no network needed
    if (cached && cached.data.length > 0 && Date.now() - cached.cachedAt < TEMPLATE_CACHE_TTL) {
      return cached.data
    }

    // No Supabase — serve stale cache or seed
    if (!isSupabaseConfigured || !supabase) return cached?.data ?? fallback

    const { data, error } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('activa', true)
      .order('tipo')
      .order('orden')

    if (error) {
      console.error('Error loading checklist templates from Supabase', error)
      // Stale cache beats seed — clinic may have custom templates not in the seed
      return cached?.data ?? fallback
    }

    if (data && data.length > 0) {
      const templates = (data as ChecklistTemplateRow[]).map(fromTemplateRow)
      const entry: TemplateCacheEntry = { data: templates, cachedAt: Date.now() }
      setItem(TEMPLATE_CACHE_KEY, entry)
      return templates
    }

    // Supabase empty — seed and cache
    const { error: seedError } = await supabase
      .from('checklist_templates')
      .upsert(fallback.map(toTemplateRow), { onConflict: 'id' })
    if (seedError) console.error('Error seeding checklist templates', seedError)

    const entry: TemplateCacheEntry = { data: fallback, cachedAt: Date.now() }
    setItem(TEMPLATE_CACHE_KEY, entry)
    return fallback
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

  /** Load all completions for a given date (daily + weekly for Resumen). */
  async loadAllForDate(fecha: string): Promise<{ daily: ChecklistCompletion[]; weekly: ChecklistCompletion[] }> {
    const [year, month, day] = fecha.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    const { semana, año } = getISOWeek(d)
    const weekKey = getWeekKey(año, semana)

    const [daily, weekly] = await Promise.all([
      this.load(fecha, { fecha }),
      this.load(weekKey, { semana, año }),
    ])
    return { daily, weekly }
  },

  async toggle(
    key: string,
    templateId: string,
    filters: { fecha?: string; semana?: number; año?: number },
    userId?: string,
    userName?: string
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
      completadoPorNombre: userName,
      ...filters,
    }
    const next = [...current, newCompletion]
    setItem(storageKey, next)

    if (isSupabaseConfigured && supabase && clinicId !== 'local') {
      const { error } = await supabase
        .from('checklist_completions')
        .upsert([toRow(newCompletion)], { onConflict: 'id', ignoreDuplicates: true })
      if (error) console.error('Error saving checklist completion', error)
    }

    return next
  },

  async updateCantidad(
    key: string,
    templateId: string,
    filters: { fecha?: string; semana?: number; año?: number },
    cantidad: number | null,
    userId?: string,
    userName?: string
  ): Promise<ChecklistCompletion[]> {
    const storageKey = completionStorageKey(key)
    const clinicId = getCurrentClinicId() ?? 'local'
    const current = getItem<ChecklistCompletion[]>(storageKey, [])
    const existingIdx = current.findIndex((c) => c.templateId === templateId)

    if (existingIdx >= 0) {
      const updated = { ...current[existingIdx], cantidad }
      const next = [...current]
      next[existingIdx] = updated
      setItem(storageKey, next)

      if (isSupabaseConfigured && supabase && clinicId !== 'local') {
        await supabase.from('checklist_completions').update({ cantidad }).eq('id', updated.id)
      }
      return next
    }

    // cantidad = null with no completion: nothing to do (avoids phantom completion)
    if (cantidad === null) return current

    // Not yet completed — create with quantity (auto-marks as done); cantidad = 0 is valid
    const newCompletion: ChecklistCompletion = {
      id: crypto.randomUUID(),
      clinicId,
      templateId,
      completadoPor: userId,
      completadoEn: new Date().toISOString(),
      completadoPorNombre: userName,
      cantidad,
      ...filters,
    }
    const next = [...current, newCompletion]
    setItem(storageKey, next)

    if (isSupabaseConfigured && supabase && clinicId !== 'local') {
      const { error } = await supabase
        .from('checklist_completions')
        .upsert([toRow(newCompletion)], { onConflict: 'id', ignoreDuplicates: true })
      if (error) console.error('Error saving checklist completion with cantidad', error)
    }

    return next
  },
}
