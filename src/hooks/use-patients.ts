import { useState, useEffect, useCallback } from 'react'
import type { Patient } from '../types'
import { defaultPatients } from '../data/seed'
import { patientStore, patientStorageKey } from '../lib/data-store'
import { getItem } from '../utils/storage'

interface UsePatientsReturn {
  patients: Patient[]
  addPatient: (patient: Omit<Patient, 'id'>) => void
  updatePatient: (id: string, updates: Omit<Patient, 'id'>) => void
  deletePatient: (id: string) => void
  searchPatients: (query: string) => Patient[]
}

export function usePatients(): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>(() =>
    getItem<Patient[]>(patientStorageKey(), defaultPatients)
  )

  useEffect(() => {
    let cancelled = false

    patientStore.load().then((loaded) => {
      if (!cancelled) {
        setPatients(loaded)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const addPatient = useCallback((patient: Omit<Patient, 'id'>) => {
    const newPatient: Patient = { id: crypto.randomUUID(), ...patient }
    setPatients((prev) => [...prev, newPatient])
    void patientStore.create(newPatient)
  }, [])

  const updatePatient = useCallback((id: string, updates: Omit<Patient, 'id'>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
    void patientStore.update(id, updates)
  }, [])

  const deletePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
    void patientStore.delete(id)
  }, [])

  const searchPatients = useCallback(
    (query: string): Patient[] => {
      if (!query.trim()) return patients
      const lower = query.toLowerCase()
      return patients.filter(
        (p) =>
          p.nombre.toLowerCase().includes(lower) ||
          p.telefono.includes(lower) ||
          p.historialResumido.toLowerCase().includes(lower)
      )
    },
    [patients]
  )

  return { patients, addPatient, updatePatient, deletePatient, searchPatients }
}
