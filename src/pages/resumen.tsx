import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import type { ChecklistTipo } from '../types'
import { useResumen, type ResumenItem } from '../hooks/use-resumen'
import { formatLocalDateKey, parseDateKey, shiftDateKey } from '../utils/date'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<ChecklistTipo, string> = {
  apertura: 'Apertura',
  durante_dia: 'Durante el día',
  cierre: 'Cierre',
  semanal: 'Semanal',
}

const TIPO_COLORS: Record<ChecklistTipo, string> = {
  apertura: 'bg-amber-50 text-amber-700',
  durante_dia: 'bg-blue-50 text-blue-700',
  cierre: 'bg-rose-50 text-rose-700',
  semanal: 'bg-violet-50 text-violet-700',
}

function formatHora(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(dateKey: string): string {
  const d = parseDateKey(dateKey)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function ResumenCard({ item }: { item: ResumenItem }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="flex-1 text-sm font-medium leading-snug text-stone-800">
          {item.titulo}
        </span>
        {item.cantidad != null && (
          <span className="shrink-0 rounded-lg bg-rose-100 px-2 py-0.5 text-sm font-bold text-rose-700">
            {item.cantidad}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={['rounded-full px-2.5 py-0.5 text-[11px] font-medium', TIPO_COLORS[item.tipo]].join(' ')}>
          {TIPO_LABELS[item.tipo]}
        </span>
        <span className="text-[11px] text-stone-400">{item.categoria}</span>
        <span className="ml-auto text-[11px] font-medium text-stone-500">{formatHora(item.completadoEn)}</span>
      </div>
      {item.completadoPorNombre && (
        <p className="mt-2 text-[11px] text-stone-400">{item.completadoPorNombre}</p>
      )}
    </div>
  )
}

// ─── Desktop row ──────────────────────────────────────────────────────────────

function ResumenRow({ item, index }: { item: ResumenItem; index: number }) {
  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-stone-500">
        {formatHora(item.completadoEn)}
      </td>
      <td className="px-4 py-3 text-sm text-stone-800">{item.titulo}</td>
      <td className="px-4 py-3">
        <span className={['rounded-full px-2.5 py-0.5 text-[11px] font-medium', TIPO_COLORS[item.tipo]].join(' ')}>
          {TIPO_LABELS[item.tipo]}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-stone-500">{item.categoria}</td>
      <td className="px-4 py-3 text-center">
        {item.cantidad != null ? (
          <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-sm font-bold text-rose-700">
            {item.cantidad}
          </span>
        ) : (
          <span className="text-stone-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-stone-400">
        {item.completadoPorNombre ?? '—'}
      </td>
    </tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Resumen() {
  const [fecha, setFecha] = useState(formatLocalDateKey())
  const { items, loading } = useResumen(fecha)
  const isToday = fecha === formatLocalDateKey()
  const dateLabel = formatDateLabel(fecha)

  const tipoCount = useMemo(() => {
    const counts: Partial<Record<ChecklistTipo, number>> = {}
    for (const item of items) {
      counts[item.tipo] = (counts[item.tipo] ?? 0) + 1
    }
    return counts
  }, [items])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Header — hidden on mobile since app header already shows the page title */}
      <div className="mb-6 hidden lg:block">
        <h1 className="text-xl font-bold text-stone-800">Resumen del día</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Registros completados del checklist operativo
        </p>
      </div>

      {/* Date navigation */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <button
          onClick={() => setFecha((prev) => shiftDateKey(prev, -1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
          aria-label="Día anterior"
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
          onClick={() => setFecha((prev) => shiftDateKey(prev, 1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
          aria-label="Día siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats bar — uses items.length (consistent with rendered content, not raw completions) */}
      {!loading && (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-stone-100 bg-white px-4 py-3">
          <ClipboardList size={16} className="shrink-0 text-stone-400" />
          <span className="text-sm text-stone-600">
            <span className="font-semibold text-stone-800">{items.length}</span>{' '}
            {items.length === 1 ? 'ítem completado' : 'ítems completados'}
          </span>
          {items.length > 0 ? (
            <div className="ml-auto flex flex-wrap gap-1.5">
              {(['apertura', 'durante_dia', 'cierre', 'semanal'] as ChecklistTipo[])
                .filter((t) => tipoCount[t])
                .map((t) => (
                  <span
                    key={t}
                    className={['rounded-full px-2 py-0.5 text-[11px] font-medium', TIPO_COLORS[t]].join(' ')}
                  >
                    {TIPO_LABELS[t]} · {tipoCount[t]}
                  </span>
                ))}
            </div>
          ) : (
            <span className="ml-auto text-xs text-stone-400">Sin actividad registrada</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-stone-400">
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 py-16 text-center">
          <ClipboardList size={32} className="text-stone-300" />
          <p className="text-sm font-medium text-stone-500">Sin actividad para esta fecha</p>
          <p className="text-xs text-stone-400">
            Los ítems completados del checklist aparecerán aquí
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2.5 lg:hidden">
            {items.map((item) => (
              <ResumenCard key={item.id} item={item} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-stone-100 lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Ítem
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Responsable
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {items.map((item, i) => (
                  <ResumenRow key={item.id} item={item} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
