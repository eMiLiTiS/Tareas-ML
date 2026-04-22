export type TaskFilter = 'todas' | 'pendientes' | 'respondidas' | 'si' | 'no'

interface TaskFiltersProps {
  activeFilter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  counts: {
    todas: number
    pendientes: number
    respondidas: number
    si: number
    no: number
  }
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'respondidas', label: 'Respondidas' },
  { value: 'si', label: 'Si' },
  { value: 'no', label: 'No' },
]

export function TaskFilters({ activeFilter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map(({ value, label }) => {
        const isActive = activeFilter === value
        const count = counts[value]

        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
              isActive
                ? 'bg-rose-500 text-white shadow-sm'
                : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
            ].join(' ')}
          >
            {label}
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
