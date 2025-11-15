import type { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  title: string
  description: string
  number: string
}

export function FeatureCard({ 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  title, 
  description, 
  number 
}: FeatureCardProps) {
  return (
    <div className="group glass-hover p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          <Icon className={iconColor} size={24} />
        </div>
        <span className="text-xs font-medium text-white/40">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

