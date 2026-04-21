import { User, Phone, FileText, Edit2, Trash2 } from 'lucide-react'
import type { Patient } from '../../types'

interface PatientCardProps {
  patient: Patient
  onEdit: (patient: Patient) => void
  onDelete: (id: string) => void
}

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      {/* Avatar + name row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <User size={18} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800 leading-tight">{patient.nombre}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone size={11} className="text-stone-400" />
              <span className="text-xs text-stone-500">{patient.telefono}</span>
            </div>
          </div>
        </div>

        {/* Actions (always visible on mobile, hover on desktop) */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(patient)}
            className="p-2 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title="Editar paciente"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(patient.id)}
            className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Eliminar paciente"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* History */}
      {patient.historialResumido && (
        <div className="flex items-start gap-2 bg-stone-50 rounded-xl px-3 py-2">
          <FileText size={13} className="text-stone-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-stone-500 leading-relaxed">{patient.historialResumido}</p>
        </div>
      )}
    </div>
  )
}
