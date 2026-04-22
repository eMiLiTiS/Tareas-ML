import { useState } from 'react'
import type { Page } from './types'
import { Sidebar } from './components/layout/sidebar'
import { Header } from './components/layout/header'
import { BottomNav } from './components/layout/bottom-nav'
import { Dashboard } from './pages/dashboard'
import { Tasks } from './pages/tasks'
import { Patients } from './pages/patients'
import { Appointments } from './pages/appointments'
import { Settings } from './pages/settings'
import { Checklist } from './pages/checklist'
import { Resumen } from './pages/resumen'
import { ActividadSemanal } from './pages/actividad-semanal'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'tareas':
        return <Tasks />
      case 'pacientes':
        return <Patients />
      case 'citas':
        return <Appointments />
      case 'configuracion':
        return <Settings />
      case 'checklist':
        return <Checklist />
      case 'resumen':
        return <Resumen />
      case 'actividad-semanal':
        return <ActividadSemanal />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex overflow-x-hidden">
      {/* Sidebar — static on desktop, overlay on mobile */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          currentPage={currentPage}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Page content — bottom padding accounts for mobile bottom nav */}
        <main className="flex-1 overflow-y-auto pb-safe-nav lg:pb-0">
          {renderPage()}
        </main>
      </div>

      {/* Bottom navigation — mobile only */}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

export default App
