import { LogOut, Menu } from 'lucide-react'
import type { Page } from '../../types'
import { useAuth } from '../../auth/auth-context'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Button } from '../ui/button'

interface HeaderProps {
  currentPage: Page
  onOpenSidebar: () => void
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  tareas: 'Tareas del día',
  pacientes: 'Pacientes',
  citas: 'Citas',
  configuracion: 'Configuración',
  checklist: 'Checklist operativo',
  resumen: 'Resumen del día',
  'actividad-semanal': 'Actividad semanal',
}

function getTodayShort() {
  const now = new Date()
  return now.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function Header({ currentPage, onOpenSidebar }: HeaderProps) {
  const { session, profile, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-stone-100 bg-white/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-stone-500 transition-colors hover:bg-stone-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-7 items-center justify-center rounded-lg bg-rose-500 px-2 overflow-hidden">
            <span className="max-w-32 truncate text-xs font-semibold text-white">
              {profile?.clinicName || 'Clinica'}
            </span>
          </div>
          <h1 className="truncate text-base font-semibold text-stone-800">{pageTitles[currentPage]}</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs capitalize text-stone-400 sm:inline">{getTodayShort()}</span>

          {isSupabaseConfigured ? (
            <>
              {(profile?.nombre || session?.user.email) && (
                <span className="hidden max-w-44 truncate text-xs text-stone-500 lg:inline">
                  {profile?.nombre || session?.user.email}
                </span>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void signOut()
                }}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Cerrar sesion</span>
              </Button>
            </>
          ) : (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
              Modo local
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
