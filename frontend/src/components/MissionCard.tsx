interface MissionCardProps {
  title: string
  reward: string
  progress?: number
  completed?: boolean
}

export function MissionCard({ title, reward, progress = 0, completed = false }: MissionCardProps) {
  return (
    <div 
      className={`p-4 rounded-lg bg-white/5 border border-white/10 space-y-2 ${
        !completed && 'opacity-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-secondary">{reward}</span>
      </div>
      {progress > 0 && (
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

