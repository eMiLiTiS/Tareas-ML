import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChecklistCompletion, ChecklistTemplate, ChecklistTipo } from '../types'
import { checklistCompletionStore, checklistTemplateStore, getWeekKey } from '../lib/checklist-store'
import { getISOWeek } from '../utils/date'
import { useAuth } from '../auth/auth-context'

// Re-export for backward compatibility with pages that imported from here
export { getISOWeek } from '../utils/date'

interface UseChecklistResult {
  templates: ChecklistTemplate[]
  completions: ChecklistCompletion[]
  completedIds: Set<string>
  completionByTemplateId: Map<string, ChecklistCompletion>
  toggle: (templateId: string) => Promise<void>
  setCantidad: (templateId: string, cantidad: number | null) => Promise<void>
  loading: boolean
  progress: { total: number; done: number }
  progressByCategory: Record<string, { total: number; done: number }>
}

export function useChecklist(tipo: ChecklistTipo, fecha: string): UseChecklistResult {
  const { session, profile } = useAuth()
  const [allTemplates, setAllTemplates] = useState<ChecklistTemplate[]>(() =>
    checklistTemplateStore.load()
  )
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const templates = useMemo(
    () => allTemplates.filter((t) => t.tipo === tipo),
    [allTemplates, tipo]
  )

  const { key, filters } = useMemo(() => {
    if (tipo === 'semanal') {
      const [year, month, day] = fecha.split('-').map(Number)
      const d = new Date(year, month - 1, day)
      const { semana, año } = getISOWeek(d)
      return { key: getWeekKey(año, semana), filters: { semana, año } }
    }
    return { key: fecha, filters: { fecha } }
  }, [tipo, fecha])

  // For weekly items each worker tracks their own state; daily items are clinic-wide
  const userId = tipo === 'semanal' ? session?.user.id : undefined

  useEffect(() => {
    let cancelled = false
    checklistTemplateStore.loadAsync().then((data) => {
      if (!cancelled) setAllTemplates(data)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    checklistCompletionStore.load(key, filters, userId).then((data) => {
      if (!cancelled) {
        setCompletions(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [key, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const completedIds = useMemo(() => new Set(completions.map((c) => c.templateId)), [completions])

  const completionByTemplateId = useMemo(() => {
    const map = new Map<string, ChecklistCompletion>()
    for (const c of completions) map.set(c.templateId, c)
    return map
  }, [completions])

  const toggle = useCallback(
    async (templateId: string) => {
      const next = await checklistCompletionStore.toggle(
        key, templateId, filters,
        session?.user.id,
        profile?.nombre || session?.user.email
      )
      setCompletions(next)
    },
    [key, filters, session?.user.id, profile?.nombre, session?.user.email] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const setCantidad = useCallback(
    async (templateId: string, cantidad: number | null) => {
      const next = await checklistCompletionStore.updateCantidad(
        key, templateId, filters, cantidad,
        session?.user.id,
        profile?.nombre || session?.user.email
      )
      setCompletions(next)
    },
    [key, filters, session?.user.id, profile?.nombre, session?.user.email] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const progress = useMemo(
    () => ({
      total: templates.length,
      done: templates.filter((t) => completedIds.has(t.id)).length,
    }),
    [templates, completedIds]
  )

  const progressByCategory = useMemo(() => {
    const result: Record<string, { total: number; done: number }> = {}
    for (const t of templates) {
      if (!result[t.categoria]) result[t.categoria] = { total: 0, done: 0 }
      result[t.categoria].total++
      if (completedIds.has(t.id)) result[t.categoria].done++
    }
    return result
  }, [templates, completedIds])

  return {
    templates,
    completions,
    completedIds,
    completionByTemplateId,
    toggle,
    setCantidad,
    loading,
    progress,
    progressByCategory,
  }
}
