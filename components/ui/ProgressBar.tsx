interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: 'amber' | 'green' | 'blue' | 'slate'
  height?: 'sm' | 'md' | 'lg'
  showPercent?: boolean
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  color = 'amber',
  height = 'md',
  showPercent = false,
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)

  const trackColors = {
    amber: 'bg-amber-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    slate: 'bg-slate-100',
  }

  const barColors = {
    amber: 'bg-amber-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    slate: 'bg-slate-400',
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className="w-full space-y-1">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-sm text-slate-600">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-xs text-slate-400">{percent}%</span>}
        </div>
      )}
      <div className={`w-full ${trackColors[color]} rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`${heights[height]} ${barColors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
