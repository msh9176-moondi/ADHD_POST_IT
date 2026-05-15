export default function HandwriteAnim() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 120, height: 64 }}
      aria-hidden="true"
    >
      {/* 줄지 배경 */}
      <div className="absolute inset-0 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.35)' }}>
        {[6, 26, 46].map((top) => (
          <div
            key={top}
            className="absolute left-2 right-2 h-px"
            style={{ top, background: 'rgba(120,53,15,0.18)' }}
          />
        ))}
      </div>

      {/* 그려지는 선 3개 */}
      <div
        className="absolute h-[2px] rounded-full animate-pen-line-1"
        style={{ top: 6, left: 8, background: '#1e293b', width: 0 }}
      />
      <div
        className="absolute h-[2px] rounded-full animate-pen-line-2"
        style={{ top: 26, left: 8, background: '#1e293b', width: 0 }}
      />
      <div
        className="absolute h-[2px] rounded-full animate-pen-line-3"
        style={{ top: 46, left: 8, background: '#1e293b', width: 0 }}
      />

      {/* 연필 아이콘 */}
      <div
        className="absolute animate-pen-move"
        style={{ fontSize: 14, lineHeight: 1, marginLeft: 8 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-35deg)' }}>
          <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </div>
    </div>
  )
}
