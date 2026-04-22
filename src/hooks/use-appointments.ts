import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Appointment, AppointmentStatus } from '../types'
import { defaultAppointments } from '../data/seed'
import { appointmentStore } from '../lib/data-store'
import { useAuth } from '../auth/auth-context'

type AppointmentInput = Omit<
  Appointment,
  'id' | 'createdBy' | 'updatedBy' | 'createdByLabel' | 'updatedByLabel' | 'createdAt' | 'updatedAt'
>

interface UseAppointmentsReturn {
  appointments: Appointment[]
  upcomingAppointments: Appointment[]
  addAppointment: (appt: AppointmentInput) => void
  updateAppointment: (id: string, updates: Partial<AppointmentInput>) => void
  deleteAppointment: (id: string) => void
  updateStatus: (id: string, status: AppointmentStatus) => void
}

export function useAppointments(): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments)
  const { session, profile } = useAuth()

  const actorLabel = profile?.nombre?.trim() || profile?.email || session?.user.email || 'Sin registrar'

  useEffect(() => {
    let cancelled = false

    appointmentStore.load().then((loaded) => {
      if (!cancelled) {
        setAppointments(loaded)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.estado === 'proxima')
      .sort((a, b) => {
        const dateA = `${a.fecha}T${a.hora}`
        const dateB = `${b.fecha}T${b.hora}`
        return dateA.localeCompare(dateB)
      })
  }, [appointments])

  const addAppointment = useCallback((appt: AppointmentInput) => {
    const now = new Date().toISOString()
    const actorId = session?.user.id ?? null
    const newAppt: Appointment = {
      id: crypto.randomUUID(),
      ...appt,
      createdBy: actorId,
      updatedBy: actorId,
      createdByLabel: actorLabel,
      updatedByLabel: actorLabel,
      createdAt: now,
      updatedAt: now,
    }
    setAppointments((prev) => [...prev, newAppt])
    void appointmentStore.create(newAppt)
  }, [actorLabel, session?.user.id])

  const updateAppointment = useCallback(
    (id: string, updates: Partial<AppointmentInput>) => {
      const now = new Date().toISOString()
      const actorId = session?.user.id ?? null
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, ...updates, updatedBy: actorId, updatedByLabel: actorLabel, updatedAt: now }
            : a
        )
      )
      void appointmentStore.update(id, {
        ...updates,
        updatedBy: actorId,
        updatedByLabel: actorLabel,
        updatedAt: now,
      })
    },
    [actorLabel, session?.user.id]
  )

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    void appointmentStore.delete(id)
  }, [])

  const updateStatus = useCallback((id: string, status: AppointmentStatus) => {
    const now = new Date().toISOString()
    const actorId = session?.user.id ?? null
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, estado: status, updatedBy: actorId, updatedByLabel: actorLabel, updatedAt: now }
          : a
      )
    )
    void appointmentStore.update(id, {
      estado: status,
      updatedBy: actorId,
      updatedByLabel: actorLabel,
      updatedAt: now,
    })
  }, [actorLabel, session?.user.id])

  return {
    appointments,
    upcomingAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
  }
}
