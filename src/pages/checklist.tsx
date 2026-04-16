import { useState } from 'react'
import { ChevronDown, ChevronRight, Check } from 'lucide-react'
import type { ChecklistTipo } from '../types'
import { useChecklist, getISOWeek } from '../hooks/use-checklist'
import { formatLocalDateKey, shiftDateKey, parseDateKey } from '../utils/date'

const TABS: { tipo: ChecklistTipo; label: string }[] = [
  { tipo: 'apertura', label: 'Apertura' },
  { tipo: 'durante_dia', label: 'Durante el día' },
  { tipo: 'cierre', label: 'Cierre' },
  { tipo: 'semanal', label: 'Semanal' },
]

function formatDateLabel(dateKey: string): string {
  const d = parseDateKey(dateKey)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatWeekLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const { semana, año } = getISOWeek(d)
  return `Semana ${semana} · ${año}`
}

interface CategoryGroupProps {
  categoria: string
  items: { id: string; titulo: string }[]
  completedIds: Set<string>
  onToggle: (id: string) => void
  progress: { total: number; done: number }
}

function CategoryGroup({ categoria, items, completedIds, onToggle, progress }: CategoryGroupProps) {
  const [open, setOpen] = useState(true)
  const allDone = progress.done === progress.total

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-stone-50"
      >
        <div className="flex items-center gap-2.5">
          {open ? (
            <ChevronDown size={15} className="text-stone-400" />
          ) : (
            <ChevronRight size={15} className="text-stone-400" />
          )}
          <span className="text-sm font-semibold text-stone-700">{categoria}</span>
          {allDone && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
              Completado
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs font-medium text-stone-400">
          {progress.done}/{progress.total}
        </span>
      </button>

      <div className="mx-4">
        <div className="h-px bg-stone-100" />
        <div className="h-1 overflow-hidden rounded-full bg-stone-100 my-0">
          <div
            className="h-full rounded-full bg-rose-400 transition-all duration-300"
            style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {open && (
        <ul className="px-4 pb-3 pt-2 flex flex-col gap-1">
          {items.map((item) => {
            const done = completedIds.has(item.id)
            return (
              <li key={item.id}>
                <button
                  onClick={() => onToggle(item.id)}
                  className={[
                    'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                    done ? 'bg-emerald-50' : 'hover:bg-stone-50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150',
                      done
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-stone-300 bg-white',
                    ].join(' ')}
                  >
                    {done && <Check size={12} strokeWidth={3} className="text-white" />}
                  </span>
                  <span
                    className={[
                      'text-sm leading-snug transition-colors',
                      done ? 'text-emerald-700 line-through decoration-emerald-300' : 'text-stone-700',
                    ].join(' ')}
                  >
                    {item.titulo}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

interface ChecklistTabProps {
  tipo: ChecklistTipo
  fecha: string
}

function ChecklistTab({ tipo, fecha }: ChecklistTabProps) {
  const { templates, completedIds, toggle, loading, progress, progressByCategory } = useChecklist(tipo, fecha)

  const categories = [...new Set(templates.map((t) => t.categoria))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-stone-400">
        Cargando...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Overall progress */}
      <div className="rounded-2xl border border-stone-100 bg-white px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-600">
            Progreso general
          </span>
          <span className="text-sm font-semibold text-stone-800">
            {progress.done}
            <span className="font-normal text-stone-400">/{progress.total}</span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-rose-500 transition-all duration-500"
            style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
          />
        </div>
        {progress.done === progress.total && progress.total > 0 && (
          <p className="mt-2 text-xs font-medium text-emerald-600">Todo completado ✓</p>
        )}
      </div>

      {/* Category groups */}
      {categories.map((cat) => {
        const items = templates.filter((t) => t.categoria === cat)
        return (
          <CategoryGroup
            key={cat}
            categoria={cat}
            items={items}
            completedIds={completedIds}
            onToggle={toggle}
            progress={progressByCategory[cat] ?? { total: 0, done: 0 }}
          />
        )
      })}
    </div>
  )
}

export function Checklist() {
  const [tipo, setTipo] = useState<ChecklistTipo>('apertura')
  const [fecha, setFecha] = useState(formatLocalDateKey())

  const isSemanal = tipo === 'semanal'
  const dateLabel = isSemanal ? formatWeekLabel(fecha) : formatDateLabel(fecha)
  const isToday = fecha === formatLocalDateKey()

  function navigate(days: number) {
    setFecha((prev) => shiftDateKey(prev, isSemanal ? days * 7 : days))
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Date / week navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
        >
          ←
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="truncate text-center text-sm font-semibold capitalize text-stone-800">
            {dateLabel}
          </span>
          {!isToday && (
            <button
              onClick={() => setFecha(formatLocalDateKey())}
              className="shrink-0 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
            >
              Hoy
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(1)}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
        >
          →
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 grid grid-cols-4 gap-1 rounded-2xl bg-stone-100 p-1">
        {TABS.map(({ tipo: t, label }) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={[
              'rounded-xl py-2 text-xs font-semibold transition-all duration-150',
              tipo === t
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ChecklistTab key={`${tipo}-${fecha}`} tipo={tipo} fecha={fecha} />
    </div>
  )
}
