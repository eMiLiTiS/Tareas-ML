import React from 'react'
import { useAuth } from './auth-context'
import { AuthScreen } from './auth-screen'

function ConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white px-8 py-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <span className="text-xl">⚠️</span>
        </div>
        <h1 className="text-lg font-semibold text-stone-900">Configuracion incompleta</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Las variables de entorno de Supabase no estan configuradas.
          La aplicacion no puede iniciarse sin conexion a la base de datos.
        </p>
        <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-left font-mono text-xs text-stone-600">
          VITE_SUPABASE_URL<br />
          VITE_SUPABASE_ANON_KEY
        </p>
      </div>
    </div>
  )
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, isConfigured } = useAuth()

  if (!isConfigured) {
    return <ConfigError />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="rounded-3xl border border-stone-200 bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-rose-100" />
          <p className="mt-4 text-sm font-medium text-stone-700">Cargando sesion...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return <>{children}</>
}
