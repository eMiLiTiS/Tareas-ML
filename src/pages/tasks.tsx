import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useTasks } from '../hooks/use-tasks'
import { TaskList } from '../components/tasks/task-list'
import { TaskFilters, type TaskFilter } from '../components/tasks/task-filters'
import type { Task } from '../types'
import { Button } from '../components/ui/button'
import { formatLocalDateKey, parseDateKey, shiftDateKey } from '../utils/date'

function formatDateDisplay(dateStr: string): string {
  const today = formatLocalDateKey()
  const yesterday = shiftDateKey(today, -1)
  const tomorrow = shiftDateKey(today, 1)

  if (dateStr === today) return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  if (dateStr === tomorrow) return 'Manana'

  return parseDateKey(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function matchesNoFilter(task: Task): boolean {
  return (
    task.estado === 'respondida' &&
    (task.valorRespuesta === false || (task.tipoRespuesta === 'number' && task.valorRespuesta !== null))
  )
}

function applyFilter(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'pendientes':
      return tasks.filter((task) => task.estado === 'pendiente')
    case 'respondidas':
      return tasks.filter((task) => task.estado === 'respondida')
    case 'si':
      return tasks.filter((task) => task.estado === 'respondida' && task.valorRespuesta === true)
    case 'no':
      return tasks.filter(matchesNoFilter)
    default:
      return tasks
  }
}

export function Tasks() {
  const today = formatLocalDateKey()
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [filter, setFilter] = useState<TaskFilter>('todas')

  const { tasks, answerTask, resetAnswer, resetDay, stats } = useTasks(selectedDate)
  const filteredTasks = useMemo(() => applyFilter(tasks, filter), [tasks, filter])

  const filterCounts = useMemo(() => {
    const result = { todas: tasks.length, pendientes: 0, respondidas: 0, si: 0, no: 0 }
    for (const task of tasks) {
      if (task.estado === 'pendiente') {
        result.pendientes++
      } else {
        result.respondidas++
        if (task.valorRespuesta === true) result.si++
        if (matchesNoFilter(task)) result.no++
      }
    }
    return result
  }, [tasks])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Tareas del dia</h1>
        <p className="mt-1 text-sm text-stone-500">Gestiona las tareas operativas del equipo</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
        <button
          onClick={() => setSelectedDate((date) => shiftDateKey(date, -1))}
          className="rounded-xl p-2.5 text-stone-500 transition-colors hover:bg-stone-100"
          aria-label="Dia anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 min-w-0 text-center">
          <p className="truncate text-sm font-semibold capitalize text-stone-800">{formatDateDisplay(selectedDate)}</p>
          <p className="text-xs text-stone-400">{selectedDate}</p>
        </div>

        <button
          onClick={() => setSelectedDate((date) => shiftDateKey(date, 1))}
          className="rounded-xl p-2.5 text-stone-500 transition-colors hover:bg-stone-100"
          aria-label="Dia siguiente"
        >
          <ChevronRight size={18} />
        </button>

        {selectedDate !== today && (
          <button
            onClick={() => setSelectedDate(today)}
            className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-100"
          >
            Hoy
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Total', value: tasks.length, color: 'bg-stone-50 text-stone-600' },
          { label: 'Pendientes', value: stats.pending, color: 'bg-amber-50 text-amber-600' },
          { label: 'Completadas', value: stats.done, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'No realizadas', value: stats.no, color: 'bg-rose-50 text-rose-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-2.5 text-center`}>
            <div className="text-xl font-bold leading-none">{value}</div>
            <div className="mt-1 text-xs font-medium opacity-80">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters activeFilter={filter} onFilterChange={setFilter} counts={filterCounts} />
        <Button
          variant="ghost"
          size="sm"
          onClick={resetDay}
          className="text-stone-500 hover:bg-rose-50 hover:text-rose-500"
          title="Reiniciar todas las tareas del dia"
        >
          <RotateCcw size={13} />
          Reiniciar dia
        </Button>
      </div>

      <TaskList tasks={filteredTasks} onAnswer={answerTask} onReset={resetAnswer} />
    </div>
  )
}
