import React, { useEffect, useState } from 'react'
import { Plus, Info, UserCog, Trash2 } from 'lucide-react'
import type { TaskCategory, TaskArea, TaskResponseType, TaskPriority } from '../types'
import { useSettings } from '../hooks/use-settings'
import { useAuth } from '../auth/auth-context'
import { Badge } from '../components/ui/badge'
import { Modal } from '../components/ui/modal'
import { Input, Select, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'

interface NewTemplateForm {
  titulo: string
  descripcion: string
  categoria: TaskCategory
  area: TaskArea
  tipoRespuesta: TaskResponseType
  prioridad: TaskPriority
}

interface ProfileForm {
  nombre: string
  puesto: string
  telefono: string
  notas: string
}

const defaultTemplateForm: NewTemplateForm = {
  titulo: '',
  descripcion: '',
  categoria: 'apertura',
  area: 'general',
  tipoRespuesta: 'boolean',
  prioridad: 'media',
}

const categoriaOptions: { value: TaskCategory; label: string }[] = [
  { value: 'apertura', label: 'Apertura' },
  { value: 'cierre', label: 'Cierre' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'cabina', label: 'Cabina' },
  { value: 'revision', label: 'Revision' },
  { value: 'administrativa', label: 'Administrativa' },
  { value: 'comercial', label: 'Comercial' },
]

const areaOptions: { value: TaskArea; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'estetica', label: 'Estetica' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
]

const tipoOptions: { value: TaskResponseType; label: string }[] = [
  { value: 'boolean', label: 'Si / No' },
  { value: 'number', label: 'Numero' },
]

const prioridadOptions: { value: TaskPriority; label: string }[] = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

export function Settings() {
  const { templates, toggleTemplate, addTemplate, deleteTemplate } = useSettings()
  const { isConfigured, profile, session, updateProfile } = useAuth()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [templateForm, setTemplateForm] = useState<NewTemplateForm>(defaultTemplateForm)
  const [titleError, setTitleError] = useState('')

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nombre: '',
    puesto: '',
    telefono: '',
    notas: '',
  })
  const [profileError, setProfileError] = useState('')
  const [profileInfo, setProfileInfo] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const activeCount = templates.filter((template) => template.activa).length

  useEffect(() => {
    setProfileForm({
      nombre: profile?.nombre ?? '',
      puesto: profile?.puesto ?? '',
      telefono: profile?.telefono ?? '',
      notas: profile?.notas ?? '',
    })
  }, [profile])

  function handleTemplateSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!templateForm.titulo.trim()) {
      setTitleError('El titulo es obligatorio')
      return
    }

    addTemplate({
      titulo: templateForm.titulo.trim(),
      descripcion: templateForm.descripcion.trim() || undefined,
      categoria: templateForm.categoria,
      area: templateForm.area,
      tipoRespuesta: templateForm.tipoRespuesta,
      prioridad: templateForm.prioridad,
    })

    setTemplateForm(defaultTemplateForm)
    setTitleError('')
    setIsAddOpen(false)
  }

  function handleCloseTemplateModal() {
    setTemplateForm(defaultTemplateForm)
    setTitleError('')
    setIsAddOpen(false)
  }

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    setProfileError('')
    setProfileInfo('')

    if (!isConfigured) {
      setProfileError('El perfil del trabajador requiere Supabase activo.')
      return
    }

    if (!profileForm.nombre.trim()) {
      setProfileError('El nombre del trabajador es obligatorio.')
      return
    }

    setSavingProfile(true)
    const result = await updateProfile({
      nombre: profileForm.nombre.trim(),
      puesto: profileForm.puesto.trim(),
      telefono: profileForm.telefono.trim(),
      notas: profileForm.notas.trim(),
    })
    setSavingProfile(false)

    if (result.error) {
      setProfileError(result.error)
      return
    }

    setProfileInfo('Perfil guardado correctamente.')
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Configuracion</h1>
        <p className="mt-1 text-sm text-stone-500">Gestiona las plantillas de tareas diarias y el perfil del equipo</p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
            <UserCog size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-800">Perfil del trabajador</h2>
            <p className="mt-1 text-sm text-stone-500">
              Guarda el nombre, puesto y datos del usuario autenticado.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <Input label="Email de acceso" value={session?.user.email ?? ''} disabled />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Nombre del trabajador"
              placeholder="Ej: Marta Ruiz"
              value={profileForm.nombre}
              onChange={(event) => setProfileForm((current) => ({ ...current, nombre: event.target.value }))}
            />
            <Input
              label="Puesto"
              placeholder="Ej: Fisioterapeuta"
              value={profileForm.puesto}
              onChange={(event) => setProfileForm((current) => ({ ...current, puesto: event.target.value }))}
            />
          </div>
          <Input
            label="Telefono"
            placeholder="Ej: 600 123 456"
            value={profileForm.telefono}
            onChange={(event) => setProfileForm((current) => ({ ...current, telefono: event.target.value }))}
          />
          <Textarea
            label="Notas internas"
            placeholder="Turno habitual, especialidad, observaciones..."
            rows={3}
            value={profileForm.notas}
            onChange={(event) => setProfileForm((current) => ({ ...current, notas: event.target.value }))}
          />

          {profileError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {profileError}
            </div>
          )}

          {profileInfo && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {profileInfo}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={savingProfile || !isConfigured}>
              {savingProfile ? 'Guardando...' : 'Guardar perfil'}
            </Button>
          </div>
        </form>
      </section>

      <div className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-rose-400" />
        <div>
          <p className="mb-1 text-sm font-medium text-rose-800">Como funcionan las plantillas?</p>
          <p className="text-xs leading-relaxed text-rose-700">
            Cada dia, el sistema genera automaticamente las tareas activas de esta lista. Puedes activar o desactivar
            plantillas para que aparezcan o no en el dia a dia. Los cambios se aplican a los nuevos dias; las tareas
            ya generadas no se ven afectadas.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-stone-700">{activeCount} plantillas activas</span>
          <span className="ml-2 text-xs text-stone-400">de {templates.length} totales</span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} />
          Nueva plantilla
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className={[
              'flex items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all',
              template.activa ? 'border-stone-200' : 'border-stone-100 opacity-60',
            ].join(' ')}
          >
            <button
              onClick={() => toggleTemplate(template.id)}
              title={template.activa ? 'Desactivar plantilla' : 'Activar plantilla'}
              className={[
                'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
                template.activa ? 'bg-rose-400' : 'bg-stone-200',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                  template.activa ? 'translate-x-4' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="leading-snug text-sm font-medium text-stone-800">{template.titulo}</p>
                <div className="flex shrink-0 gap-1">
                  <Badge variant="prioridad" value={template.prioridad} />
                </div>
              </div>
              {template.descripcion && (
                <p className="mt-0.5 text-xs leading-relaxed text-stone-400">{template.descripcion}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="categoria" value={template.categoria} />
                <Badge variant="area" value={template.area} />
                <span className="inline-flex items-center rounded-full bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-500">
                  {template.tipoRespuesta === 'boolean' ? 'Si / No' : 'Numero'}
                </span>
              </div>
            </div>

            <button
              onClick={() => deleteTemplate(template.id)}
              className="shrink-0 rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-400"
              title="Eliminar plantilla"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={handleCloseTemplateModal} title="Nueva plantilla de tarea" size="md">
        <form onSubmit={handleTemplateSubmit} className="flex flex-col gap-4">
          <Input
            label="Titulo de la tarea"
            placeholder="Ej: Limpieza de equipos al cierre"
            value={templateForm.titulo}
            onChange={(event) => {
              setTemplateForm((current) => ({ ...current, titulo: event.target.value }))
              setTitleError('')
            }}
            error={titleError}
            autoFocus
          />
          <Textarea
            label="Descripcion (opcional)"
            placeholder="Detalles adicionales sobre la tarea..."
            value={templateForm.descripcion}
            onChange={(event) => setTemplateForm((current) => ({ ...current, descripcion: event.target.value }))}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoria"
              value={templateForm.categoria}
              onChange={(event) => setTemplateForm((current) => ({ ...current, categoria: event.target.value as TaskCategory }))}
              options={categoriaOptions}
            />
            <Select
              label="Area"
              value={templateForm.area}
              onChange={(event) => setTemplateForm((current) => ({ ...current, area: event.target.value as TaskArea }))}
              options={areaOptions}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo de respuesta"
              value={templateForm.tipoRespuesta}
              onChange={(event) =>
                setTemplateForm((current) => ({ ...current, tipoRespuesta: event.target.value as TaskResponseType }))
              }
              options={tipoOptions}
            />
            <Select
              label="Prioridad"
              value={templateForm.prioridad}
              onChange={(event) =>
                setTemplateForm((current) => ({ ...current, prioridad: event.target.value as TaskPriority }))
              }
              options={prioridadOptions}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleCloseTemplateModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              <Plus size={14} />
              Anadir plantilla
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
