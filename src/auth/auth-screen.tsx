import React, { useState } from 'react'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from './auth-context'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

export function AuthScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email y contrasena son obligatorios.')
      return
    }

    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    if (result.error) {
      setError(result.error)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe4e6,transparent_35%),linear-gradient(180deg,#fffdfc_0%,#fff7f5_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden flex-col justify-between bg-gradient-to-br from-rose-500 via-rose-400 to-orange-300 p-10 text-white lg:flex">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/70">Espacio Maria Lujan</p>
              <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight">
                Acceso seguro a pacientes, citas y tareas.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                Solo usuarios con cuenta pueden acceder. Contacta al administrador si necesitas acceso.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="font-semibold">Auth</p>
                <p className="mt-1 text-white/75">Email y contrasena</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="font-semibold">Datos</p>
                <p className="mt-1 text-white/75">Protegidos por RLS</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="font-semibold">Sesion</p>
                <p className="mt-1 text-white/75">Persistente</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-sm font-medium text-rose-500">Iniciar sesion</p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-900">Entrar a la aplicacion</h2>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  Usa tu cuenta para acceder.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
                <Input
                  label="Contrasena"
                  type="password"
                  placeholder="Tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" fullWidth disabled={submitting}>
                  <LockKeyhole size={16} />
                  {submitting ? 'Procesando...' : 'Entrar'}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
