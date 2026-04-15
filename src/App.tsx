import { useState } from 'react'
import type { Page } from './types'
import { Sidebar } from './components/layout/sidebar'
import { Header } from './components/layout/header'
import { Dashboard } from './pages/dashboard'
import { Tasks } from './pages/tasks'
import { Patients } from './pages/patients'
import { Appointments } from './pages/appointments'
import { Settings } from './pages/settings'

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
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Mobile header */}
        <Header
          currentPage={currentPage}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
