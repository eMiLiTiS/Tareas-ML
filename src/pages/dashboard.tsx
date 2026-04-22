import {
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import type { Page } from '../types'
import { useTasks } from '../hooks/use-tasks'
import { useAppointments } from '../hooks/use-appointments'
import { StatsCard } from '../components/dashboard/stats-card'
import { TaskCard } from '../components/tasks/task-card'
import { AppointmentCard } from '../components/appointments/appointment-card'
import { Button } from '../components/ui/button'
import { formatLocalDateKey, parseDateKey } from '../utils/date'

interface DashboardProps {
  onNavigate: (page: Page) => void
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos dias'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDateLong(dateStr: string) {
  const date = parseDateKey(dateStr)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const today = formatLocalDateKey()
  const { tasks, answerTask, resetAnswer, stats } = useTasks(today)
  const { upcomingAppointments, updateStatus } = useAppointments()

  const pendingTasks = tasks.filter((task) => task.estado === 'pendiente').slice(0, 5)
  const answeredCount = tasks.filter((task) => task.estado === 'respondida').length
  const totalTasks = tasks.length
  const progressPercent = totalTasks > 0 ? Math.round((answeredCount / totalTasks) * 100) : 0
  const todayAppointments = upcomingAppointments.filter((appointment) => appointment.fecha === today)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">{getGreeting()}, equipo</h1>
        <p className="mt-1 text-sm capitalize text-stone-500">{formatDateLong(today)}</p>
      </div>

      {totalTasks > 0 && (
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">Progreso del dia</span>
            <span className="text-sm font-bold text-rose-500">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-stone-100">
            <div
              className="h-2.5 rounded-full bg-rose-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-stone-400">
            {answeredCount} de {totalTasks} tareas completadas
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard icon={<Clock size={18} />} value={stats.pending} label="Pendientes" color="amber" />
        <StatsCard icon={<CheckCircle2 size={18} />} value={stats.done} label="Completadas" color="emerald" />
        <StatsCard icon={<XCircle size={18} />} value={stats.no} label="No realizadas" color="rose" />
        <StatsCard icon={<Hash size={18} />} value={stats.numbers} label="Registros" color="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-800">Tareas pendientes</h2>
            <span className="text-xs text-stone-400">{stats.pending} restantes</span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-stone-600">Todo completado</p>
              <p className="mt-1 text-xs text-stone-400">No quedan tareas pendientes para hoy.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onAnswer={answerTask} onReset={resetAnswer} />
                ))}
              </div>
              {stats.pending > 5 && (
                <div className="mt-3 border-t border-stone-100 pt-3">
                  <p className="text-center text-xs text-stone-400">+{stats.pending - 5} tareas mas</p>
                </div>
              )}
            </>
          )}

          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => onNavigate('tareas')}
              className="text-rose-500 hover:bg-rose-50"
            >
              Ver todas las tareas
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-stone-800">Citas de hoy</h2>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-stone-400" />
                <span className="text-xs text-stone-400">{todayAppointments.length} citas</span>
              </div>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-stone-500">No hay citas para hoy</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayAppointments.slice(0, 4).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onUpdateStatus={updateStatus}
                    showDate={false}
                  />
                ))}
              </div>
            )}

            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => onNavigate('citas')}
                className="text-rose-500 hover:bg-rose-50"
              >
                Ver todas las citas
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-rose-100/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-rose-800">Resumen rapido</h3>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center justify-between">
                <span className="text-xs text-rose-700">Tareas totales hoy</span>
                <span className="text-xs font-bold text-rose-800">{totalTasks}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-xs text-rose-700">Progreso</span>
                <span className="text-xs font-bold text-rose-800">{progressPercent}%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-xs text-rose-700">Citas proximas</span>
                <span className="text-xs font-bold text-rose-800">{upcomingAppointments.length}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
