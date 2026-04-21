import React from 'react'
import { LayoutDashboard, CheckSquare, Users, Calendar, Settings, X, LogOut, ClipboardList, BarChart2 } from 'lucide-react'
import type { Page } from '../../types'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../auth/auth-context'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  isOpen: boolean
  onClose: () => void
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { page: 'checklist', label: 'Checklist', icon: <ClipboardList size={18} /> },
  { page: 'resumen', label: 'Resumen', icon: <BarChart2 size={18} /> },
  { page: 'tareas', label: 'Tareas', icon: <CheckSquare size={18} /> },
  { page: 'pacientes', label: 'Pacientes', icon: <Users size={18} /> },
  { page: 'citas', label: 'Citas', icon: <Calendar size={18} /> },
  { page: 'configuracion', label: 'Configuración', icon: <Settings size={18} /> },
]

function getTodayLabel() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { session, profile, signOut } = useAuth()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-stone-900/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-stone-100 bg-white',
          'transition-transform duration-300 ease-in-out',
          'lg:static lg:h-auto lg:flex lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-sm">
              <span className="text-sm font-bold tracking-tight text-white">CP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-stone-800">
                {profile?.clinicName || 'Clinica'}
              </span>
              <span className="text-xs leading-tight text-stone-500">
                {profile?.nombre || 'Equipo'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 lg:hidden"
            aria-label="Cerrar menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-4 h-px bg-stone-100" />

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map(({ page, label, icon }) => {
            const isActive = currentPage === page

            return (
              <button
                key={page}
                onClick={() => {
                  onNavigate(page)
                  onClose()
                }}
                className={[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800',
                ].join(' ')}
              >
                <span className={isActive ? 'text-rose-500' : 'text-stone-400'}>{icon}</span>
                {label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-500" />}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-stone-100 px-5 py-4">
          <p className="text-xs capitalize text-stone-400">{getTodayLabel()}</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-500">
            <span
              className={`h-2 w-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
            {isSupabaseConfigured ? 'Supabase conectado' : 'Modo local'}
          </div>
          {(profile?.nombre || session?.user.email) && (
            <p className="mt-3 truncate text-xs text-stone-500">{profile?.nombre || session?.user.email}</p>
          )}
          {profile?.puesto && <p className="mt-1 truncate text-[11px] text-stone-400">{profile.puesto}</p>}
          {isSupabaseConfigured && (
            <button
              onClick={() => {
                void signOut()
                onClose()
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              <LogOut size={13} />
              Cerrar sesion
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
