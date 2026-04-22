import { useMemo, useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import type { Patient } from '../types'
import { usePatients } from '../hooks/use-patients'
import { PatientCard } from '../components/patients/patient-card'
import { PatientForm } from '../components/patients/patient-form'
import { Modal, ConfirmModal } from '../components/ui/modal'
import { Button } from '../components/ui/button'

export function Patients() {
  const { patients, addPatient, updatePatient, deletePatient, searchPatients } = usePatients()

  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const displayed = useMemo(() => searchPatients(searchQuery), [searchQuery, searchPatients])

  function handleOpenAdd() {
    setEditingPatient(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(patient: Patient) {
    setEditingPatient(patient)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingPatient(null)
  }

  function handleSave(data: Omit<Patient, 'id'>) {
    if (editingPatient) {
      updatePatient(editingPatient.id, data)
    } else {
      addPatient(data)
    }
    handleCloseForm()
  }

  function handleDeleteConfirm() {
    if (deletingId) {
      deletePatient(deletingId)
      setDeletingId(null)
    }
  }

  const deletingPatient = patients.find((patient) => patient.id === deletingId)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Pacientes</h1>
          <p className="mt-1 text-sm text-stone-500">
            {patients.length} {patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <UserPlus size={16} />
          Anadir paciente
        </Button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Buscar por nombre, telefono o historial..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            <Users size={28} className="text-stone-400" />
          </div>
          <p className="font-medium text-stone-600">{searchQuery ? 'Sin resultados' : 'No hay pacientes aun'}</p>
          <p className="mt-1 text-sm text-stone-400">
            {searchQuery ? 'Prueba con otro termino de busqueda.' : 'Anade tu primer paciente con el boton de arriba.'}
          </p>
          {!searchQuery && (
            <Button variant="primary" size="md" className="mt-4" onClick={handleOpenAdd}>
              <UserPlus size={16} />
              Anadir paciente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {displayed.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onEdit={handleOpenEdit} onDelete={setDeletingId} />
          ))}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingPatient ? 'Editar paciente' : 'Anadir paciente'}>
        <PatientForm patient={editingPatient} onSave={handleSave} onCancel={handleCloseForm} />
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar paciente"
        message={`Estas segura de que quieres eliminar a ${deletingPatient?.nombre ?? 'este paciente'}? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  )
}
