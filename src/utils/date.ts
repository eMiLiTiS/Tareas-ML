export function getISOWeek(date: Date): { semana: number; año: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const semana = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { semana, año: d.getUTCFullYear() }
}

export function formatLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function shiftDateKey(dateKey: string, days: number): string {
  const next = parseDateKey(dateKey)
  next.setDate(next.getDate() + days)
  return formatLocalDateKey(next)
}
