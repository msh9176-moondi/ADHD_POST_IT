'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

interface GuideStep {
  emoji: string
  title: string
  body: string
  bullets: string[]
  highlight: string
  note: string
}

const STEPS: GuideStep[] = [
  {
    emoji: '🧠',
    title: '미루는 뇌에는 시간이 두 가지만 있어요',
    body: '"지금"과 "지금이 아님". 먼 미래의 마감, 내일 해야 할 일은 뇌에 실감이 잘 안 돼요.',
    bullets: [
      '의지가 부족한 게 아니에요',
      '시간을 느끼는 방식이 다른 거예요',
      '그래서 오늘, 지금, 10분이 필요해요',
    ],
    highlight: '뇌 구조의 차이예요. 당신의 잘못이 아니에요.',
    note: '출처: 《Driven to Distraction》',
  },
  {
    emoji: '⏱',
    title: '하고 싶지 않아도 괜찮아요',
    body: '과제를 시작하기 위해 "하고 싶다"는 감정은 필요 없어요.',
    bullets: [
      '시작할 수 있을 만큼의 마음만 있으면 돼요',
      '최악이라도 10분은 버틸 수 있어요',
      '10분 후 계속할지, 멈출지 그때 결정해요',
    ],
    highlight: '일단 시작하면 기분이 달라져요.',
    note: '출처: 《집중력 대처기술 안내서》',
  },
  {
    emoji: '📤',
    title: '브레인 덤프 — 머릿속을 밖으로 꺼내야 해요',
    body: '미루는 뇌는 작업 기억이 약해서 여러 생각이 동시에 떠다녀요.',
    bullets: [
      '머릿속 뱅뱅 도는 생각은 실행을 방해해요',
      '종이에 꺼내면 뇌가 그걸 붙잡지 않아도 돼요',
      '잘 쓸 필요 없어요. 다 털어내면 돼요',
    ],
    highlight: '꺼내는 순간 뇌가 실행 모드로 전환돼요.',
    note: '출처: 《집중력 대처기술 안내서》',
  },
  {
    emoji: '✍️',
    title: '포스트잇에 손으로 쓰는 이유가 있어요',
    body: '손으로 직접 쓰면 뇌의 기억 저장이 강화돼요. 타이핑보다 훨씬 잘 각인돼요.',
    bullets: [
      '모니터 옆, 책상 위, 화장실 거울 앞에 붙여두세요',
      '눈에 보이면 뇌가 "지금 할 일"로 인식해요',
      '구체적인 행동 문장으로 써야 실행이 돼요',
    ],
    highlight: '"해야지"가 아니라 "지금 이거야"로 만드는 힘이에요.',
    note: '출처: 《집중력 대처기술 안내서》',
  },
  {
    emoji: '🔔',
    title: '미루고 싶다면 — 그게 신호예요',
    body: '회피하고 싶은 충동은 의지 부족이 아니에요. 뇌가 보내는 신호예요.',
    bullets: [
      '신호 인식 → 포스트잇 확인 → 3분만 시작',
      '그래도 어려우면 3분 대체 행동만 해도 돼요',
      '회피 충동 후 완수하면 보상을 주세요',
    ],
    highlight: '신호를 알아채는 것 자체가 대처의 시작이에요.',
    note: '출처: 《집중력 대처기술 안내서》',
  },
  {
    emoji: '🔄',
    title: '중단해도 괜찮아요 — 복귀가 더 중요해요',
    body: '미루는 뇌에게 중요한 건 완주가 아니라 복귀 횟수예요.',
    bullets: [
      '"또 실패했다"가 아니라 "다시 시작한다"예요',
      '중단됐을 때 NFC를 다시 찍으면 돼요',
      '복귀하는 그 순간이 다시 시작하는 신호예요',
    ],
    highlight: '복귀 자체가 실행력이에요.',
    note: '출처: 《집중력 대처기술 안내서》',
  },
]

function GuideContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const [stepIndex, setStepIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const isLast = stepIndex === STEPS.length - 1
  const step = STEPS[stepIndex]

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return
    if (dx < 0) goNext()
    else goPrev()
  }

  function goNext() {
    if (isLast) {
      router.push('/grounding')
    } else {
      setStepIndex(i => i + 1)
    }
  }

  function goPrev() {
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? 'w-4 h-2 bg-amber-400'
                  : i < stepIndex
                  ? 'w-2 h-2 bg-amber-200'
                  : 'w-2 h-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div
          key={stepIndex}
          className="flex-1 flex flex-col animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Icon */}
          <div className="text-6xl text-center mb-6">{step.emoji}</div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-800 text-center leading-snug mb-6 px-2">
            {step.title}
          </h2>

          {/* Body */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1 flex flex-col gap-4">
            <p className="text-slate-600 leading-relaxed text-sm">
              {step.body}
            </p>

            <ul className="space-y-2.5">
              {step.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 block" />
                  </span>
                  <span className="text-sm text-slate-700 leading-snug">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl px-4 py-3">
              <p className="text-amber-800 font-semibold text-sm leading-snug">
                {step.highlight}
              </p>
            </div>

            <p className="text-xs text-slate-300">{step.note}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="pt-8 pb-6 space-y-3 safe-bottom">
          <Button onClick={goNext}>
            {isLast
              ? (from === 'setup' ? '이제 시작해볼게요 →' : '확인했어요 →')
              : '다음 →'}
          </Button>
          {stepIndex > 0 && (
            <button
              onClick={goPrev}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              ← 이전
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => router.push('/grounding')}
              className="w-full text-center text-sm text-slate-300 hover:text-slate-500 transition-colors py-1"
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default function GuidePage() {
  return (
    <Suspense>
      <GuideContent />
    </Suspense>
  )
}
