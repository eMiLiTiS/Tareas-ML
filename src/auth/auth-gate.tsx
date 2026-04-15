import React from 'react'
import { useAuth } from './auth-context'
import { AuthScreen } from './auth-screen'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, isConfigured } = useAuth()

  if (!isConfigured) {
    return <>{children}</>
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
