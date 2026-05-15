interface XPBarProps {
  totalXp: number
  showLabel?: boolean
}

export default function XPBar({ totalXp, showLabel = true }: XPBarProps) {
  const level = Math.floor(totalXp / 100) + 1
  const xpInCurrentLevel = totalXp % 100
  const progressPercent = xpInCurrentLevel

  const treeEmoji = level <= 2 ? '🌱' : level <= 5 ? '🌿' : level <= 10 ? '🌳' : '🌲'

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{treeEmoji}</span>
            <span className="font-semibold text-slate-700">레벨 {level}</span>
          </div>
          <span className="text-slate-500 text-xs">
            {xpInCurrentLevel} / 100 XP
          </span>
        </div>
      )}
      <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Lv.{level}</span>
        <span>총 {totalXp} XP</span>
        <span>Lv.{level + 1}</span>
      </div>
    </div>
  )
}
