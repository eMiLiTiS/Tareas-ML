import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Users, ClipboardList } from 'lucide-react'
import { useActividadSemanal, type ActividadSemanalItem } from '../hooks/use-actividad-semanal'
import { formatLocalDateKey, shiftDateKey } from '../utils/date'
import type { ChecklistTipo } from '../types'

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

function getInitials(nombre?: string): string {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function ActividadCard({ item }: { item: ActividadSemanalItem }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4">
      <div className="mb-2 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">
          {getInitials(item.completadoPorNombre)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-stone-500">
            {item.completadoPorNombre ?? '—'}
          </p>
          <p className="mt-0.5 text-sm font-medium leading-snug text-stone-800">{item.titulo}</p>
        </div>
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
    </div>
  )
}

// ─── Desktop row ──────────────────────────────────────────────────────────────

function ActividadRow({ item, index }: { item: ActividadSemanalItem; index: number }) {
  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-600">
            {getInitials(item.completadoPorNombre)}
          </div>
          <span className="text-sm text-stone-700">{item.completadoPorNombre ?? '—'}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-stone-800">{item.titulo}</td>
      <td className="px-4 py-3 text-center">
        {item.cantidad != null ? (
          <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-sm font-bold text-rose-700">
            {item.cantidad}
          </span>
        ) : (
          <span className="text-stone-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={['rounded-full px-2.5 py-0.5 text-[11px] font-medium', TIPO_COLORS[item.tipo]].join(' ')}>
          {TIPO_LABELS[item.tipo]}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-stone-500">{item.categoria}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-stone-400">
        {formatHora(item.completadoEn)}
      </td>
    </tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ActividadSemanal() {
  const [fecha, setFecha] = useState(formatLocalDateKey())
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos')
  const { items, loading, usuarios, semana, año } = useActividadSemanal(fecha)

  const weekLabel = `Semana ${semana} · ${año}`

  const itemsFiltrados = useMemo(() => {
    if (filtroUsuario === 'todos') return items
    return items.filter(
      (i) => (i.completadoPor ?? i.completadoPorNombre ?? '—') === filtroUsuario
    )
  }, [items, filtroUsuario])

  function navigate(weeks: number) {
    setFecha((prev) => shiftDateKey(prev, weeks * 7))
  }

  const isCurrentWeek = useMemo(() => {
    const today = formatLocalDateKey()
    return fecha === today || shiftDateKey(fecha, -6) <= today && today <= fecha
  }, [fecha])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 hidden lg:block">
        <h1 className="text-xl font-bold text-stone-800">Actividad semanal</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Registros semanales de todo el equipo
        </p>
      </div>

      {/* Week navigation */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <span className="text-center text-sm font-semibold text-stone-800">{weekLabel}</span>
          {!isCurrentWeek && (
            <button
              onClick={() => setFecha(formatLocalDateKey())}
              className="shrink-0 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
            >
              Esta semana
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
          aria-label="Semana siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats + filter bar */}
      {!loading && (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-stone-100 bg-white px-4 py-3">
          <Users size={16} className="shrink-0 text-stone-400" />
          <span className="text-sm text-stone-600">
            <span className="font-semibold text-stone-800">{itemsFiltrados.length}</span>{' '}
            {itemsFiltrados.length === 1 ? 'registro' : 'registros'}
            {usuarios.length > 1 && (
              <span className="text-stone-400">
                {' '}· {usuarios.length} usuarios
              </span>
            )}
          </span>

          {/* User filter */}
          {usuarios.length > 1 && (
            <div className="ml-auto flex flex-wrap gap-1.5">
              <button
                onClick={() => setFiltroUsuario('todos')}
                className={[
                  'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  filtroUsuario === 'todos'
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                ].join(' ')}
              >
                Todos
              </button>
              {usuarios.map((u) => (
                <button
                  key={u.key}
                  onClick={() => setFiltroUsuario(filtroUsuario === u.key ? 'todos' : u.key)}
                  className={[
                    'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                    filtroUsuario === u.key
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                  ].join(' ')}
                >
                  {u.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-stone-400">
          Cargando...
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-200 py-16 text-center">
          <ClipboardList size={32} className="text-stone-300" />
          <p className="text-sm font-medium text-stone-500">Sin actividad semanal registrada</p>
          <p className="text-xs text-stone-400">
            Los ítems semanales completados por el equipo aparecerán aquí
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2.5 lg:hidden">
            {itemsFiltrados.map((item) => (
              <ActividadCard key={item.id} item={item} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-stone-100 lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Ítem
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Registrado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {itemsFiltrados.map((item, i) => (
                  <ActividadRow key={item.id} item={item} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
