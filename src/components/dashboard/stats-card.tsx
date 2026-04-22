import React from 'react'

interface StatsCardProps {
  icon: React.ReactNode
  value: number | string
  label: string
  color?: 'rose' | 'emerald' | 'amber' | 'stone' | 'indigo'
  subtitle?: string
}

const colorMap = {
  rose: {
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    valueColor: 'text-rose-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
    valueColor: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    valueColor: 'text-amber-600',
  },
  stone: {
    bg: 'bg-stone-50',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-500',
    valueColor: 'text-stone-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
    valueColor: 'text-indigo-600',
  },
}

export function StatsCard({ icon, value, label, color = 'stone', subtitle }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className={`${c.bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`${c.iconBg} rounded-xl p-2.5 flex-shrink-0`}>
        <span className={c.iconColor}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-2xl font-bold ${c.valueColor} leading-none`}>{value}</div>
        <div className="text-xs text-stone-500 font-medium mt-0.5 leading-tight">{label}</div>
        {subtitle && <div className="text-xs text-stone-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}
