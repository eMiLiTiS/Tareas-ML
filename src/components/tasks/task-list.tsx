import type { Task, TaskCategory } from '../../types'
import { TaskCard } from './task-card'

interface TaskListProps {
  tasks: Task[]
  onAnswer: (id: string, value: boolean | number) => void
  onReset: (id: string) => void
}

const categoryOrder: TaskCategory[] = [
  'apertura',
  'cabina',
  'limpieza',
  'revision',
  'administrativa',
  'comercial',
  'cierre',
]

const categoryLabels: Record<TaskCategory, string> = {
  apertura: 'Apertura',
  cierre: 'Cierre',
  limpieza: 'Limpieza',
  cabina: 'Cabina',
  revision: 'Revisión',
  administrativa: 'Administrativa',
  comercial: 'Comercial',
}

const categoryEmoji: Record<TaskCategory, string> = {
  apertura: '🌅',
  cierre: '🌙',
  limpieza: '✨',
  cabina: '💆',
  revision: '🔍',
  administrativa: '📋',
  comercial: '💼',
}

export function TaskList({ tasks, onAnswer, onReset }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-stone-500 font-medium text-sm">No hay tareas</p>
        <p className="text-stone-400 text-xs mt-1">No se encontraron tareas con los filtros actuales.</p>
      </div>
    )
  }

  // Group tasks by category
  const grouped = new Map<TaskCategory, Task[]>()
  for (const cat of categoryOrder) {
    const catTasks = tasks.filter((t) => t.categoria === cat)
    if (catTasks.length > 0) {
      grouped.set(cat, catTasks)
    }
  }
  // Also handle any categories not in the order list
  for (const task of tasks) {
    if (!grouped.has(task.categoria)) {
      grouped.set(task.categoria, tasks.filter((t) => t.categoria === task.categoria))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(grouped.entries()).map(([cat, catTasks]) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">{categoryEmoji[cat] ?? '📌'}</span>
            <h3 className="text-sm font-semibold text-stone-700">{categoryLabels[cat] ?? cat}</h3>
            <span className="text-xs text-stone-400">
              ({catTasks.filter((t) => t.estado === 'respondida').length}/{catTasks.length})
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {catTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAnswer={onAnswer}
                onReset={onReset}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
