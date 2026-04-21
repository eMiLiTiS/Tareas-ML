import { LayoutDashboard, ClipboardList, BarChart2, Calendar, CheckSquare } from 'lucide-react'
import type { Page } from '../../types'

interface BottomNavProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
  { page: 'checklist', label: 'Checklist', icon: <ClipboardList size={20} /> },
  { page: 'resumen', label: 'Resumen', icon: <BarChart2 size={20} /> },
  { page: 'citas', label: 'Citas', icon: <Calendar size={20} /> },
  { page: 'tareas', label: 'Tareas', icon: <CheckSquare size={20} /> },
]

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-100 bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ page, label, icon }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={[
                'flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[10px] font-semibold transition-colors',
                active ? 'text-rose-600' : 'text-stone-400 hover:text-stone-600',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center transition-transform duration-150',
                  active ? 'scale-110' : '',
                ].join(' ')}
              >
                {icon}
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
