import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Clinic, WorkerProfile } from '../types'
import { isSupabaseConfigured, setCurrentClinicId, supabase } from '../lib/supabase'
import { invalidateTemplateCache } from '../lib/checklist-store'

interface AuthContextValue {
  session: Session | null
  profile: WorkerProfile | null
  clinic: Clinic | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    clinicName: string,
    clinicCode?: string
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  updateProfile: (
    updates: Omit<WorkerProfile, 'id' | 'email' | 'clinicId' | 'clinicName' | 'clinicAccessCode'>
  ) => Promise<{ error: string | null }>
}

type WorkerProfileRow = {
  id: string
  clinic_id: string | null
  email: string
  nombre: string | null
  puesto: string | null
  telefono: string | null
  notas: string | null
}

type ClinicRow = {
  id: string
  nombre: string
  access_code: string
}

const DEFAULT_CLINIC_ID = 'bcfc7919-0e8b-48e4-9f90-72d1cfe87b78'
const AuthContext = createContext<AuthContextValue | null>(null)

function fromClinicRow(row: ClinicRow): Clinic {
  return {
    id: row.id,
    nombre: row.nombre,
    accessCode: row.access_code,
  }
}

function fromProfileRow(row: WorkerProfileRow, clinic: Clinic): WorkerProfile {
  return {
    id: row.id,
    clinicId: row.clinic_id ?? clinic.id,
    email: row.email,
    nombre: row.nombre ?? '',
    puesto: row.puesto ?? '',
    telefono: row.telefono ?? '',
    notas: row.notas ?? '',
    clinicName: clinic.nombre,
    clinicAccessCode: clinic.accessCode,
  }
}

async function loadClinicById(clinicId: string): Promise<Clinic | null> {
  if (!supabase) return null

  const { data, error } = await supabase.from('clinics').select('*').eq('id', clinicId).maybeSingle()
  if (error) {
    console.error('Error loading clinic from Supabase', error)
    return null
  }

  if (!data) return null
  return fromClinicRow(data as ClinicRow)
}

async function resolveClinicForSession(_session: Session): Promise<Clinic | null> {
  return loadClinicById(DEFAULT_CLINIC_ID)
}

async function loadOrCreateProfile(session: Session): Promise<{ profile: WorkerProfile | null; clinic: Clinic | null }> {
  if (!supabase) return { profile: null, clinic: null }

  const { data, error } = await supabase.from('worker_profiles').select('*').eq('id', session.user.id).maybeSingle()
  if (error) {
    console.error('Error loading worker profile from Supabase', error)
    return { profile: null, clinic: null }
  }

  if (data) {
    const currentRow = data as WorkerProfileRow
    let clinic = currentRow.clinic_id ? await loadClinicById(currentRow.clinic_id) : null

    if (!clinic) {
      clinic = await resolveClinicForSession(session)
      if (!clinic) {
        return { profile: null, clinic: null }
      }

      const { error: repairError } = await supabase
        .from('worker_profiles')
        .update({ clinic_id: clinic.id })
        .eq('id', session.user.id)

      if (repairError) {
        console.error('Error repairing worker profile clinic in Supabase', repairError)
        return { profile: null, clinic: null }
      }

      currentRow.clinic_id = clinic.id
    }

    return { profile: fromProfileRow(currentRow, clinic), clinic }
  }

  const clinic = await resolveClinicForSession(session)
  if (!clinic) {
    return { profile: null, clinic: null }
  }

  const newProfile: WorkerProfileRow = {
    id: session.user.id,
    clinic_id: clinic.id,
    email: session.user.email ?? '',
    nombre: '',
    puesto: '',
    telefono: '',
    notas: '',
  }

  const { error: createError } = await supabase.from('worker_profiles').upsert([newProfile], { onConflict: 'id' })
  if (createError) {
    console.error('Error creating worker profile in Supabase', createError)
    return { profile: null, clinic: null }
  }

  return { profile: fromProfileRow(newProfile, clinic), clinic }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<WorkerProfile | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      setCurrentClinicId(null)
      return
    }

    let mounted = true

    async function resolveSession(nextSession: Session | null) {
      if (!mounted) return

      setSession(nextSession)

      if (!nextSession) {
        setProfile(null)
        setClinic(null)
        setCurrentClinicId(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const { profile: nextProfile, clinic: nextClinic } = await loadOrCreateProfile(nextSession)

      if (!mounted) return

      setProfile(nextProfile)
      setClinic(nextClinic)
      setCurrentClinicId(nextProfile?.clinicId ?? null)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      void resolveSession(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_IN') invalidateTemplateCache()
      void resolveSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      clinic,
      loading,
      isConfigured: isSupabaseConfigured,
      async signIn(email, password) {
        if (!supabase) return { error: 'Supabase no esta configurado.' }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      async signUp(email, password, _clinicName, _clinicCode) {
        if (!supabase) {
          return { error: 'Supabase no esta configurado.', needsEmailConfirmation: false }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        const needsEmailConfirmation = !data.session

        return {
          error: error?.message ?? null,
          needsEmailConfirmation,
        }
      },
      async signOut() {
        if (!supabase) return
        await supabase.auth.signOut()
      },
      async updateProfile(updates) {
        if (!supabase || !session) return { error: 'No hay sesion activa.' }

        let resolvedClinic = clinic
        if (!resolvedClinic) {
          const repaired = await loadOrCreateProfile(session)
          resolvedClinic = repaired.clinic
          if (repaired.profile) {
            setProfile(repaired.profile)
            setCurrentClinicId(repaired.profile.clinicId)
          }
          if (resolvedClinic) {
            setClinic(resolvedClinic)
          }
        }

        if (!resolvedClinic) {
          return {
            error:
              'No se pudo resolver la clinica del usuario. Reaplica la migracion multi-tenant o asigna clinic_id al worker_profile en Supabase.',
          }
        }

        const nextProfile: WorkerProfile = {
          id: session.user.id,
          clinicId: resolvedClinic.id,
          email: session.user.email ?? profile?.email ?? '',
          nombre: updates.nombre,
          puesto: updates.puesto,
          telefono: updates.telefono,
          notas: updates.notas,
          clinicName: resolvedClinic.nombre,
          clinicAccessCode: resolvedClinic.accessCode,
        }

        const payload: WorkerProfileRow = {
          id: nextProfile.id,
          clinic_id: nextProfile.clinicId,
          email: nextProfile.email,
          nombre: nextProfile.nombre,
          puesto: nextProfile.puesto,
          telefono: nextProfile.telefono,
          notas: nextProfile.notas,
        }

        const { error } = await supabase.from('worker_profiles').upsert([payload], { onConflict: 'id' })
        if (error) {
          console.error('Error updating worker profile in Supabase', error)
          return { error: error.message }
        }

        setProfile(nextProfile)
        return { error: null }
      },
    }),
    [clinic, loading, profile, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
