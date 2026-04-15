import React, { useState } from 'react'
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from './auth-context'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

type AuthMode = 'login' | 'register'

export function AuthScreen() {
  const { signIn, signUp, isConfigured } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [clinicCode, setClinicCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!email.trim() || !password.trim()) {
      setError('Email y contrasena son obligatorios.')
      return
    }

    setSubmitting(true)

    if (mode === 'login') {
      const result = await signIn(email.trim(), password)
      if (result.error) {
        setError(result.error)
      }
    } else {
      const result = await signUp(email.trim(), password, clinicName.trim(), clinicCode.trim())
      if (result.error) {
        setError(result.error)
      } else if (result.needsEmailConfirmation) {
        setInfo('Revisa tu email para confirmar la cuenta antes de iniciar sesion.')
      } else {
        setInfo('Cuenta creada correctamente.')
      }
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
                La app ya usa Supabase Auth. Solo usuarios con cuenta pueden entrar y acceder a la base de datos.
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
                <p className="text-sm font-medium text-rose-500">
                  {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-900">
                  {mode === 'login' ? 'Entrar a la aplicacion' : 'Registrar nuevo acceso'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-500">
                  {isConfigured
                    ? 'Usa tu cuenta de Supabase para acceder.'
                    : 'Supabase aun no esta configurado en este entorno.'}
                </p>
              </div>

              <div className="mb-6 inline-flex rounded-2xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                    setInfo('')
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                    mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                    setInfo('')
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                    mode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                  }`}
                >
                  Crear cuenta
                </button>
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
                  placeholder="Minimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />

                {mode === 'register' && (
                  <>
                    <Input
                      label="Nombre de la clinica"
                      placeholder="Ej: Clinica Central"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      hint="Si no introduces codigo, se creara una clinica nueva con este nombre."
                    />
                    <Input
                      label="Codigo de clinica (opcional)"
                      placeholder="Ej: ABC123"
                      value={clinicCode}
                      onChange={(e) => setClinicCode(e.target.value.toUpperCase())}
                      hint="Si lo rellenas, el usuario se unira a una clinica existente."
                    />
                  </>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {info && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {info}
                  </div>
                )}

                <Button type="submit" size="lg" fullWidth disabled={submitting || !isConfigured}>
                  {mode === 'login' ? <LockKeyhole size={16} /> : <Mail size={16} />}
                  {submitting
                    ? 'Procesando...'
                    : mode === 'login'
                    ? 'Entrar'
                    : 'Crear cuenta'}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
