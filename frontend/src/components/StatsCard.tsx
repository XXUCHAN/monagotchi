interface StatsCardProps {
  label: string
  value: string | number
  subtext: string
  valueClassName?: string
}

export function StatsCard({ label, value, subtext, valueClassName = '' }: StatsCardProps) {
  return (
    <div className="glass p-5 space-y-2">
      <div className="text-white/60 text-sm">{label}</div>
      <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
      <div className="text-xs text-white/40">{subtext}</div>
    </div>
  )
}

