import { useEffect, useMemo, useState } from 'react'
import type { ChecklistCompletion, ChecklistTemplate, ChecklistTipo } from '../types'
import { checklistCompletionStore, checklistTemplateStore, getWeekKey } from '../lib/checklist-store'
import { getISOWeek } from '../utils/date'

export interface ActividadSemanalItem {
  id: string
  templateId: string
  titulo: string
  tipo: ChecklistTipo
  categoria: string
  completadoPorNombre?: string
  completadoPor?: string
  completadoEn?: string
  cantidad?: number | null
  semana: number
  año: number
}

export function useActividadSemanal(fecha: string) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const { semana, año, weekKey } = useMemo(() => {
    const [year, month, day] = fecha.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    const { semana, año } = getISOWeek(d)
    return { semana, año, weekKey: getWeekKey(año, semana) }
  }, [fecha])

  useEffect(() => {
    let cancelled = false
    checklistTemplateStore.loadAsync().then((data) => {
      if (!cancelled) setTemplates(data)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setCompletions([])
    setLoading(true)
    // No userId → returns ALL users' weekly completions for this week
    checklistCompletionStore.load(weekKey, { semana, año }).then((data) => {
      if (!cancelled) {
        setCompletions(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [weekKey, semana, año])

  const templateMap = useMemo(() => {
    const map = new Map<string, ChecklistTemplate>()
    for (const t of templates) map.set(t.id, t)
    return map
  }, [templates])

  const items = useMemo((): ActividadSemanalItem[] => {
    return completions
      .filter((c) => templateMap.has(c.templateId))
      .map((c): ActividadSemanalItem => {
        const t = templateMap.get(c.templateId)!
        return {
          id: c.id,
          templateId: c.templateId,
          titulo: t.titulo,
          tipo: t.tipo,
          categoria: t.categoria,
          completadoPorNombre: c.completadoPorNombre,
          completadoPor: c.completadoPor,
          completadoEn: c.completadoEn,
          cantidad: c.cantidad,
          semana: c.semana ?? semana,
          año: c.año ?? año,
        }
      })
      .sort((a, b) => {
        if (!a.completadoPorNombre && !b.completadoPorNombre) return 0
        if (!a.completadoPorNombre) return 1
        if (!b.completadoPorNombre) return -1
        return a.completadoPorNombre.localeCompare(b.completadoPorNombre)
      })
  }, [completions, templateMap, semana, año])

  const usuarios = useMemo(() => {
    const seen = new Set<string>()
    const list: { key: string; nombre: string }[] = []
    for (const item of items) {
      const key = item.completadoPor ?? item.completadoPorNombre ?? '—'
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ key, nombre: item.completadoPorNombre ?? '—' })
      }
    }
    return list.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [items])

  return { items, loading, usuarios, semana, año }
}
