import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Task } from '../types'
import { generateDailyTasks, defaultTemplates } from '../data/seed'
import { getItem } from '../utils/storage'
import { dailyTaskStorageKey, taskStore, templateStorageKey } from '../lib/data-store'

interface TaskStats {
  pending: number
  done: number
  no: number
  numbers: number
}

interface UseTasksReturn {
  tasks: Task[]
  answerTask: (id: string, value: boolean | number) => void
  resetAnswer: (id: string) => void
  resetDay: () => void
  stats: TaskStats
}

export function useTasks(date: string): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = getItem<Task[] | null>(dailyTaskStorageKey(date), null)
    if (stored && stored.length > 0) return stored
    const templates = getItem(templateStorageKey(), defaultTemplates)
    return generateDailyTasks(date, templates)
  })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    setIsReady(false)
    taskStore.load(date).then((loaded) => {
      if (!cancelled) {
        setTasks(loaded)
        setIsReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [date])

  useEffect(() => {
    if (!isReady) return
    taskStore.saveAll(date, tasks)
  }, [tasks, date, isReady])

  const answerTask = useCallback((id: string, value: boolean | number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, valorRespuesta: value, estado: 'respondida' as const }
          : task
      )
    )
  }, [])

  const resetAnswer = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, valorRespuesta: null, estado: 'pendiente' as const }
          : task
      )
    )
  }, [])

  const resetDay = useCallback(() => {
    const templates = getItem(templateStorageKey(), defaultTemplates)
    const generated = generateDailyTasks(date, templates)
    setTasks(generated)
  }, [date])

  const stats = useMemo<TaskStats>(() => {
    const result = { pending: 0, done: 0, no: 0, numbers: 0 }
    for (const t of tasks) {
      if (t.estado === 'pendiente') {
        result.pending++
      } else {
        if (t.valorRespuesta === true) result.done++
        if (t.valorRespuesta === false) result.no++
        if (t.tipoRespuesta === 'number') result.numbers++
      }
    }
    return result
  }, [tasks])

  return { tasks, answerTask, resetAnswer, resetDay, stats }
}
