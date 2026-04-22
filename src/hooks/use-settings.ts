import { useState, useEffect, useCallback } from 'react'
import type { TaskTemplate, TaskCategory, TaskArea, TaskResponseType, TaskPriority } from '../types'
import { defaultTemplates } from '../data/seed'
import { templateStore } from '../lib/data-store'

interface UseSettingsReturn {
  templates: TaskTemplate[]
  toggleTemplate: (id: string) => void
  updateTemplate: (id: string, updates: Partial<Omit<TaskTemplate, 'id'>>) => void
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'activa'>) => void
  deleteTemplate: (id: string) => void
}

export function useSettings(): UseSettingsReturn {
  const [templates, setTemplates] = useState<TaskTemplate[]>(defaultTemplates)

  useEffect(() => {
    let cancelled = false

    templateStore.load().then((loaded) => {
      if (!cancelled) {
        setTemplates(loaded)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const toggleTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, activa: !t.activa } : t))
      const changed = next.find((t) => t.id === id)
      if (changed) {
        void templateStore.update(id, { activa: changed.activa })
      }
      return next
    })
  }, [])

  const updateTemplate = useCallback(
    (id: string, updates: Partial<Omit<TaskTemplate, 'id'>>) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      )
      void templateStore.update(id, updates)
    },
    []
  )

  const addTemplate = useCallback(
    (template: {
      titulo: string
      descripcion?: string
      categoria: TaskCategory
      area: TaskArea
      tipoRespuesta: TaskResponseType
      prioridad: TaskPriority
    }) => {
      const newTemplate: TaskTemplate = {
        id: crypto.randomUUID(),
        activa: true,
        ...template,
      }
      setTemplates((prev) => [...prev, newTemplate])
      void templateStore.create(newTemplate)
    },
    []
  )

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    void templateStore.delete(id)
  }, [])

  return { templates, toggleTemplate, updateTemplate, addTemplate, deleteTemplate }
}
