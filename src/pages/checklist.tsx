import { useRef, useState } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, Check, Hash, X } from 'lucide-react'
import type { ChecklistCompletion, ChecklistTemplate, ChecklistTipo } from '../types'
import { useChecklist } from '../hooks/use-checklist'
import { getISOWeek, formatLocalDateKey, shiftDateKey, parseDateKey } from '../utils/date'

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

// ─── Quantity input ───────────────────────────────────────────────────────────

interface QuantityInputProps {
  value: number | null | undefined
  onSave: (v: number | null) => void
  onClose: () => void
}

function QuantityInput({ value, onSave, onClose }: QuantityInputProps) {
  const [raw, setRaw] = useState(value != null ? String(value) : '')
  const inputRef = useRef<HTMLInputElement>(null)
  // Prevents blur auto-save when user clicks one of the action buttons
  const suppressBlurRef = useRef(false)

  function parseValue(): number | null {
    const trimmed = raw.trim()
    if (trimmed === '') return null
    const n = parseFloat(trimmed.replace(',', '.'))
    return isNaN(n) || n < 0 ? null : n
  }

  function handleSave() {
    onSave(parseValue())
    onClose()
  }

  function handleBlur() {
    if (suppressBlurRef.current) {
      suppressBlurRef.current = false
      return
    }
    handleSave()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleSave() }
    if (e.key === 'Escape') { suppressBlurRef.current = true; onClose() }
  }

  function suppressBlur() {
    suppressBlurRef.current = true
  }

  return (
    <div className="px-3 pb-3 pt-1">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          min={0}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={handleKey}
          onBlur={handleBlur}
          autoFocus
          placeholder="0"
          className="h-9 w-28 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <button
          onPointerDown={suppressBlur}
          onClick={handleSave}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-rose-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
        >
          <Check size={13} strokeWidth={2.5} />
          Guardar
        </button>
        <button
          onPointerDown={suppressBlur}
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-400 hover:bg-stone-50"
          aria-label="Cancelar"
        >
          <X size={13} />
        </button>
      </div>
      {value != null && (
        <button
          onPointerDown={suppressBlur}
          onClick={() => { onSave(null); onClose() }}
          className="mt-1.5 text-[11px] text-stone-400 transition-colors hover:text-rose-500"
        >
          Quitar cantidad
        </button>
      )}
    </div>
  )
}

// ─── Category group ───────────────────────────────────────────────────────────

interface CategoryGroupProps {
  categoria: string
  items: ChecklistTemplate[]
  completedIds: Set<string>
  completionByTemplateId: Map<string, ChecklistCompletion>
  onToggle: (id: string) => void
  onSetCantidad: (id: string, cantidad: number | null) => void
  progress: { total: number; done: number }
}

function CategoryGroup({
  categoria,
  items,
  completedIds,
  completionByTemplateId,
  onToggle,
  onSetCantidad,
  progress,
}: CategoryGroupProps) {
  const [open, setOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const allDone = progress.done === progress.total

  function toggleEditing(id: string) {
    setEditingId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white">
      {/* Category header */}
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

      {/* Progress bar */}
      <div className="mx-4">
        <div className="h-px bg-stone-100" />
        <div className="h-1 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-rose-400 transition-all duration-300"
            style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Items */}
      {open && (
        <ul className="flex flex-col gap-0.5 px-2 pb-2 pt-1.5">
          {items.map((item) => {
            const done = completedIds.has(item.id)
            const completion = completionByTemplateId.get(item.id)
            const hasCantidad = completion?.cantidad != null

            return (
              <li key={item.id}>
                <div
                  className={[
                    'overflow-hidden rounded-xl transition-colors duration-150',
                    done ? 'bg-emerald-50' : '',
                  ].join(' ')}
                >
                  {/* Item row */}
                  <div className="flex min-h-[48px] items-center gap-3 px-3 py-2">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggle(item.id)}
                      className={[
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150',
                        done
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-stone-300 bg-white hover:border-stone-400',
                      ].join(' ')}
                      aria-label={done ? 'Desmarcar' : 'Marcar como hecho'}
                    >
                      {done && <Check size={12} strokeWidth={3} className="text-white" />}
                    </button>

                    {/* Title */}
                    <span
                      className={[
                        'flex-1 text-sm leading-snug',
                        done
                          ? 'text-emerald-700 line-through decoration-emerald-300'
                          : 'text-stone-700',
                      ].join(' ')}
                    >
                      {item.titulo}
                    </span>

                    {/* Quantity button */}
                    <button
                      onClick={() => toggleEditing(item.id)}
                      className={[
                        'flex h-7 min-w-[28px] shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition-colors',
                        hasCantidad
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600',
                        editingId === item.id ? 'ring-2 ring-rose-300' : '',
                      ].join(' ')}
                      aria-label="Editar cantidad"
                    >
                      {hasCantidad ? (
                        completion!.cantidad
                      ) : (
                        <Hash size={11} />
                      )}
                    </button>
                  </div>

                  {/* Inline quantity editor */}
                  {editingId === item.id && (
                    <QuantityInput
                      value={completion?.cantidad}
                      onSave={(v) => onSetCantidad(item.id, v)}
                      onClose={() => setEditingId(null)}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Checklist tab ────────────────────────────────────────────────────────────

interface ChecklistTabProps {
  tipo: ChecklistTipo
  fecha: string
}

function ChecklistTab({ tipo, fecha }: ChecklistTabProps) {
  const {
    templates,
    completedIds,
    completionByTemplateId,
    toggle,
    setCantidad,
    loading,
    progress,
    progressByCategory,
  } = useChecklist(tipo, fecha)

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
          <span className="text-sm font-medium text-stone-600">Progreso general</span>
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
        const catItems = templates.filter((t) => t.categoria === cat)
        return (
          <CategoryGroup
            key={cat}
            categoria={cat}
            items={catItems}
            completedIds={completedIds}
            completionByTemplateId={completionByTemplateId}
            onToggle={toggle}
            onSetCantidad={setCantidad}
            progress={progressByCategory[cat] ?? { total: 0, done: 0 }}
          />
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      {/* Date / week navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
          aria-label="Periodo anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <span className="truncate text-center text-sm font-semibold capitalize text-stone-800">
            {dateLabel}
          </span>
          {!isToday && (
            <button
              onClick={() => setFecha(formatLocalDateKey())}
              className="shrink-0 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
            >
              Hoy
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
          aria-label="Periodo siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1 sm:grid-cols-4">
        {TABS.map(({ tipo: t, label }) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={[
              'rounded-xl py-2.5 text-xs font-semibold transition-all duration-150',
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
