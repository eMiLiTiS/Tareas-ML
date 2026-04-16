import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChecklistCompletion, ChecklistTemplate, ChecklistTipo } from '../types'
import { checklistCompletionStore, checklistTemplateStore, getWeekKey } from '../lib/checklist-store'
import { useAuth } from '../auth/auth-context'

export function getISOWeek(date: Date): { semana: number; año: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const semana = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { semana, año: d.getUTCFullYear() }
}

interface UseChecklistResult {
  templates: ChecklistTemplate[]
  completedIds: Set<string>
  toggle: (templateId: string) => Promise<void>
  loading: boolean
  progress: { total: number; done: number }
  progressByCategory: Record<string, { total: number; done: number }>
}

export function useChecklist(tipo: ChecklistTipo, fecha: string): UseChecklistResult {
  const { session } = useAuth()
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const templates = useMemo(
    () => checklistTemplateStore.load().filter((t) => t.tipo === tipo),
    [tipo]
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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    checklistCompletionStore.load(key, filters).then((data) => {
      if (!cancelled) {
        setCompletions(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const completedIds = useMemo(() => new Set(completions.map((c) => c.templateId)), [completions])

  const toggle = useCallback(
    async (templateId: string) => {
      const next = await checklistCompletionStore.toggle(key, templateId, filters, session?.user.id)
      setCompletions(next)
    },
    [key, filters, session?.user.id] // eslint-disable-line react-hooks/exhaustive-deps
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

  return { templates, completedIds, toggle, loading, progress, progressByCategory }
}
