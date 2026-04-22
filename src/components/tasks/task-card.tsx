import React, { useState } from 'react'
import { Check, X, RotateCcw, Hash } from 'lucide-react'
import type { Task } from '../../types'
import { Badge } from '../ui/badge'

interface TaskCardProps {
  task: Task
  onAnswer: (id: string, value: boolean | number) => void
  onReset: (id: string) => void
}

const priorityDotClass: Record<string, string> = {
  alta: 'bg-red-400',
  media: 'bg-amber-400',
  baja: 'bg-stone-300',
}

export function TaskCard({ task, onAnswer, onReset }: TaskCardProps) {
  const [numberInput, setNumberInput] = useState<string>('')
  const [numberError, setNumberError] = useState<string>('')

  const isAnswered = task.estado === 'respondida'
  const isYes = isAnswered && task.valorRespuesta === true
  const isNo = isAnswered && task.valorRespuesta === false
  const isNumber = isAnswered && task.tipoRespuesta === 'number'

  function handleSaveNumber() {
    const val = parseFloat(numberInput)
    if (isNaN(val) || val < 0) {
      setNumberError('Introduce un número válido')
      return
    }
    setNumberError('')
    setNumberInput('')
    onAnswer(task.id, val)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSaveNumber()
  }

  let cardBg = 'bg-white'
  if (isYes) cardBg = 'bg-emerald-50/60'
  else if (isNo) cardBg = 'bg-rose-50/60'
  else if (isNumber) cardBg = 'bg-amber-50/60'

  return (
    <div
      className={`${cardBg} border border-stone-200 rounded-2xl px-4 py-3.5 shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      {/* Top row: priority dot + title + badges */}
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${priorityDotClass[task.prioridad] ?? 'bg-stone-300'}`}
          title={`Prioridad ${task.prioridad}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span
              className={`text-sm font-medium leading-snug ${isAnswered ? 'text-stone-500' : 'text-stone-800'}`}
            >
              {task.titulo}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="categoria" value={task.categoria} />
            <Badge variant="area" value={task.area} />
          </div>
          {task.descripcion && !isAnswered && (
            <p className="text-xs text-stone-400 mb-2 leading-relaxed">{task.descripcion}</p>
          )}
        </div>
      </div>

      {/* Response section */}
      {!isAnswered ? (
        <div className="pl-4 mt-1">
          {task.tipoRespuesta === 'boolean' ? (
            <div className="flex gap-2">
              <button
                onClick={() => onAnswer(task.id, true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
              >
                <Check size={13} />
                Sí
              </button>
              <button
                onClick={() => onAnswer(task.id, false)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 transition-colors"
              >
                <X size={13} />
                No
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Hash size={13} className="absolute left-2.5 text-stone-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    value={numberInput}
                    onChange={(e) => {
                      setNumberInput(e.target.value)
                      setNumberError('')
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                    className="w-28 pl-7 pr-2 py-2.5 text-sm rounded-xl border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none text-stone-800"
                  />
                </div>
                <button
                  onClick={handleSaveNumber}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  Guardar
                </button>
              </div>
              {numberError && (
                <span className="text-xs text-red-500">{numberError}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="pl-4 mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.tipoRespuesta === 'boolean' ? (
              isYes ? (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={11} />
                  </div>
                  <span className="text-xs font-medium">Completado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-600">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                    <X size={11} />
                  </div>
                  <span className="text-xs font-medium">No realizado</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <Hash size={11} />
                </div>
                <span className="text-xs font-medium">
                  {String(task.valorRespuesta)} registrado{Number(task.valorRespuesta) !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => onReset(task.id)}
            className="flex items-center gap-1 py-1.5 px-2 rounded-lg text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="Cambiar respuesta"
          >
            <RotateCcw size={11} />
            Cambiar
          </button>
        </div>
      )}
    </div>
  )
}
