'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

type RoutineType = 'doodle' | 'eye' | 'sensory' | 'breath'

function playTone(freq: number, dur: number, vol = 0.12) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    ctx.resume().then(() => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      osc.start()
      osc.stop(ctx.currentTime + dur)
      setTimeout(() => ctx.close(), (dur + 0.15) * 1000)
    })
  } catch {}
}

function buzz(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch {}
}

const ROUTINES = [
  { id: 'doodle' as RoutineType, icon: '✏️', title: '패턴 따라그리기', desc: '통로를 따라 손가락으로 그어보세요', dur: '자유' },
  { id: 'eye' as RoutineType, icon: '👁', title: '시선 이동', desc: '움직이는 점을 눈으로 따라가세요', dur: '약 30초' },
  { id: 'sensory' as RoutineType, icon: '🌿', title: '감각 체크', desc: '지금 이 순간 감각 3가지 찾기', dur: '약 1분' },
  { id: 'breath' as RoutineType, icon: '🫁', title: '짧은 호흡', desc: '숨 들이마시고 내쉬기 3회', dur: '약 30초' },
]

// ── 패턴 따라그리기 ────────────────────────────────────────────────
type PatternPoint = [number, number]

const TRACE_PATTERNS: { id: string; name: string; points: PatternPoint[] }[] = [
  {
    id: 's',
    name: 'S자 구불길',
    points: [[0.08,0.15],[0.92,0.15],[0.92,0.50],[0.08,0.50],[0.08,0.85],[0.92,0.85]],
  },
  {
    id: 'spiral',
    name: '나선 길',
    points: [
      [0.08,0.12],[0.92,0.12],[0.92,0.88],[0.14,0.88],
      [0.14,0.28],[0.80,0.28],[0.80,0.72],[0.26,0.72],[0.26,0.44],[0.64,0.44],
    ],
  },
  {
    id: 'zigzag',
    name: '지그재그',
    points: [[0.08,0.20],[0.33,0.80],[0.58,0.20],[0.83,0.80],[0.92,0.60]],
  },
]

function drawGuide(canvas: HTMLCanvasElement, points: PatternPoint[]) {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  const pts = points.map(([px, py]) => [px * w, py * h] as [number, number])

  ctx.clearRect(0, 0, w, h)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.strokeStyle = 'rgba(251,191,36,0.28)'
  ctx.lineWidth = 34
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.strokeStyle = 'rgba(180,83,9,0.28)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([7, 6])
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.arc(pts[0][0], pts[0][1], 11, 0, Math.PI * 2)
  ctx.fillStyle = '#22c55e'
  ctx.fill()
  ctx.font = 'bold 9px sans-serif'
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('시작', pts[0][0], pts[0][1])
  ctx.restore()

  const last = pts[pts.length - 1]
  ctx.save()
  ctx.beginPath()
  ctx.arc(last[0], last[1], 11, 0, Math.PI * 2)
  ctx.fillStyle = '#f59e0b'
  ctx.fill()
  ctx.font = 'bold 9px sans-serif'
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('끝', last[0], last[1])
  ctx.restore()
}

function TraceRoutine({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [patternIdx] = useState(() => Math.floor(Math.random() * TRACE_PATTERNS.length))
  const pattern = TRACE_PATTERNS[patternIdx]

  useEffect(() => {
    requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = canvas.offsetWidth || 360
      canvas.height = 260
      drawGuide(canvas, pattern.points)
    })
  }, [pattern])

  function getPos(canvas: HTMLCanvasElement, e: React.TouchEvent | React.MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    drawing.current = true
    const ctx = canvas.getContext('2d')!
    ctx.setLineDash([])
    const { x, y } = getPos(canvas, e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setHasDrawn(true)
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(canvas, e)
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#f59e0b'
    ctx.setLineDash([])
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endDraw() { drawing.current = false }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">통로를 따라 그어보세요</h2>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-green-600">시작</span>에서{' '}
          <span className="font-semibold text-amber-500">끝</span>까지 선을 이어보세요.
        </p>
        <p className="text-xs text-slate-400">{pattern.name} — 집중해서 손을 움직여 보세요.</p>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-2xl bg-amber-50 border-2 border-amber-200 touch-none cursor-crosshair"
        style={{ height: 260 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <Button onClick={onDone} disabled={!hasDrawn}>
        {hasDrawn ? '다 됐어요 →' : '통로를 따라 그어보세요'}
      </Button>
    </div>
  )
}

// ── 시선 이동 ────────────────────────────────────────────────
function EyeRoutine({ onDone }: { onDone: () => void }) {
  const [isRight, setIsRight] = useState(false)
  const [swingCount, setSwingCount] = useState(0)
  const [done, setDone] = useState(false)
  const TOTAL_SWINGS = 6
  const SWING_MS = 1500

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => {
      const next = swingCount + 1
      setIsRight(r => !r)
      setSwingCount(next)
      buzz(30)
      playTone(520, 0.08)
      if (next >= TOTAL_SWINGS) setDone(true)
    }, SWING_MS)
    return () => clearTimeout(t)
  }, [swingCount, done])

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">점을 눈으로 따라가세요</h2>
        <p className="text-sm text-slate-500">머리는 고정하고, 눈만 천천히 따라가요.</p>
        <p className="text-xs text-slate-400">시선 이동 기반 주의 안정화 루틴이에요.</p>
      </div>
      <div className="relative h-28 bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden">
        <div
          className="absolute w-8 h-8 rounded-full bg-amber-400 shadow-md top-1/2 -translate-y-1/2"
          style={{
            left: isRight ? 'calc(85% - 16px)' : '10%',
            transition: `left ${SWING_MS - 100}ms ease-in-out`,
          }}
        />
      </div>
      <div className="flex gap-1.5 justify-center">
        {Array.from({ length: TOTAL_SWINGS }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i < swingCount ? 'bg-amber-400' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      {done ? (
        <Button onClick={onDone}>다 됐어요 →</Button>
      ) : (
        <p className="text-center text-sm text-slate-400">잠시 따라가 봐요...</p>
      )}
    </div>
  )
}

// ── 감각 체크 ────────────────────────────────────────────────
function SensoryRoutine({ onDone }: { onDone: () => void }) {
  const [see, setSee] = useState('')
  const [hear, setHear] = useState('')
  const [feel, setFeel] = useState('')
  const canProceed = see.trim() && hear.trim() && feel.trim()

  const items = [
    { icon: '👀', label: '지금 보이는 것 1개', value: see, setter: setSee, placeholder: '예: 창문 밖 나무' },
    { icon: '👂', label: '들리는 소리 1개', value: hear, setter: setHear, placeholder: '예: 에어컨 소리' },
    { icon: '🤲', label: '몸에서 느껴지는 것 1개', value: feel, setter: setFeel, placeholder: '예: 발이 바닥에 닿는 느낌' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">지금 이 순간</h2>
        <p className="text-sm text-slate-500">각각 하나씩만 적어도 충분해요.</p>
        <p className="text-xs text-slate-400">감각 기반 현재화 루틴이에요.</p>
      </div>
      {items.map(({ icon, label, value, setter, placeholder }) => (
        <div key={label} className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span>{icon}</span><span>{label}</span>
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setter(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-800 placeholder-slate-300 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
          />
        </div>
      ))}
      <Button onClick={onDone} disabled={!canProceed}>
        {canProceed ? '확인했어요 →' : '3가지를 모두 적어주세요'}
      </Button>
    </div>
  )
}

// ── 짧은 호흡 ────────────────────────────────────────────────
function BreathRoutine({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [cycleCount, setCycleCount] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const TOTAL_CYCLES = 3

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (done) return
    const ms = phase === 'in' ? 3000 : 5000
    const t = setTimeout(() => {
      if (phase === 'in') {
        setPhase('out')
        buzz(60)
        playTone(330, 0.4, 0.1)
      } else {
        const next = cycleCount + 1
        if (next >= TOTAL_CYCLES) {
          setDone(true)
          buzz([80, 40, 80])
          playTone(440, 0.6, 0.12)
        } else {
          setCycleCount(next)
          setPhase('in')
          buzz(60)
          playTone(440, 0.4, 0.1)
        }
      }
    }, ms)
    return () => clearTimeout(t)
  }, [phase, cycleCount, done])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-1 w-full">
        <h2 className="text-xl font-bold text-slate-800">천천히 호흡해요</h2>
        <p className="text-sm text-slate-500">원을 따라 숨을 쉬어보세요.</p>
      </div>
      <div className="w-44 h-44 flex items-center justify-center">
        <div
          className="w-36 h-36 rounded-full bg-amber-300 flex items-center justify-center shadow-lg"
          style={{
            transform: `scale(${!started ? 0.65 : phase === 'in' ? 1 : 0.65})`,
            transition: started ? `transform ${phase === 'in' ? 3000 : 5000}ms ease-in-out` : 'none',
          }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-2xl">{done ? '✨' : phase === 'in' ? '↑' : '↓'}</span>
          </div>
        </div>
      </div>
      <p className="text-base font-semibold text-slate-700 text-center min-h-[1.5rem]">
        {done ? '잘 했어요!' : phase === 'in' ? '들이마시기 (3초)' : '내쉬기 (5초)'}
      </p>
      <div className="flex gap-2.5">
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < cycleCount ? 'bg-amber-400' : i === cycleCount && !done ? 'bg-amber-300' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {done ? (
        <Button onClick={onDone}>다 됐어요 →</Button>
      ) : (
        <button onClick={onDone} className="text-sm text-slate-400 hover:text-slate-600 transition-colors underline">
          건너뛰기
        </button>
      )}
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────────
const ROUTINE_IDS: RoutineType[] = ['doodle', 'eye', 'sensory', 'breath']

function pickRandom(exclude?: RoutineType): RoutineType {
  const pool = exclude ? ROUTINE_IDS.filter((id) => id !== exclude) : ROUTINE_IDS
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function GroundingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<RoutineType>(() => pickRandom())

  function proceed() { router.push('/brain-dump') }
  function switchRoutine() { setSelected((cur) => pickRandom(cur)) }

  const current = ROUTINES.find((r) => r.id === selected)!

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">
        {/* 상단 안내 */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">30초 집중하기</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            지금 이 순간에 집중해볼게요.
          </p>
        </div>

        {/* 랜덤 배정된 루틴 배지 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg">{current.icon}</span>
          <span className="text-sm font-semibold text-slate-700">{current.title}</span>
          <span className="text-xs text-slate-400 ml-1">· {current.dur}</span>
        </div>

        {/* 루틴 본문 */}
        <div key={selected} className="flex-1 animate-fade-in">
          {selected === 'doodle' && <TraceRoutine onDone={proceed} />}
          {selected === 'eye' && <EyeRoutine onDone={proceed} />}
          {selected === 'sensory' && <SensoryRoutine onDone={proceed} />}
          {selected === 'breath' && <BreathRoutine onDone={proceed} />}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 space-y-1 safe-bottom">
          <button
            onClick={switchRoutine}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 transition-colors py-3 font-medium"
          >
            🔀 다른 거 할게요
          </button>
          <button
            onClick={proceed}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
          >
            건너뛰고 바로 시작하기
          </button>
        </div>
      </div>
    </AppShell>
  )
}
