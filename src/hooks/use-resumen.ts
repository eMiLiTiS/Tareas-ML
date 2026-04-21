import { useEffect, useMemo, useState } from 'react'
import type { ChecklistCompletion, ChecklistTemplate, ChecklistTipo } from '../types'
import { checklistCompletionStore, checklistTemplateStore } from '../lib/checklist-store'

export interface ResumenItem {
  id: string
  templateId: string
  titulo: string
  tipo: ChecklistTipo
  categoria: string
  completadoPorNombre?: string
  completadoEn?: string
  cantidad?: number | null
}

export function useResumen(fecha: string) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [dailyCompletions, setDailyCompletions] = useState<ChecklistCompletion[]>([])
  const [weeklyCompletions, setWeeklyCompletions] = useState<ChecklistCompletion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    checklistTemplateStore.loadAsync().then((data) => {
      if (!cancelled) setTemplates(data)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    checklistCompletionStore.loadAllForDate(fecha).then(({ daily, weekly }) => {
      if (!cancelled) {
        setDailyCompletions(daily)
        setWeeklyCompletions(weekly)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [fecha])

  const templateMap = useMemo(() => {
    const map = new Map<string, ChecklistTemplate>()
    for (const t of templates) map.set(t.id, t)
    return map
  }, [templates])

  const items = useMemo((): ResumenItem[] => {
    const allCompletions = [...dailyCompletions, ...weeklyCompletions]
    return allCompletions
      .filter((c) => templateMap.has(c.templateId))
      .map((c): ResumenItem => {
        const t = templateMap.get(c.templateId)!
        return {
          id: c.id,
          templateId: c.templateId,
          titulo: t.titulo,
          tipo: t.tipo,
          categoria: t.categoria,
          completadoPorNombre: c.completadoPorNombre,
          completadoEn: c.completadoEn,
          cantidad: c.cantidad,
        }
      })
      .sort((a, b) => {
        if (!a.completadoEn) return 1
        if (!b.completadoEn) return -1
        return a.completadoEn.localeCompare(b.completadoEn)
      })
  }, [dailyCompletions, weeklyCompletions, templateMap])

  return { items, loading }
}
