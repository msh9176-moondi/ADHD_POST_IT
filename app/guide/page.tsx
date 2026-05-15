'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

const STEPS = [
  {
    emoji: '🧠',
    title: 'ADHD 뇌에는 시간이 두 가지만 있어요',
    body: `"지금"과 "지금이 아님".

먼 미래의 마감, 내일 해야 할 일은 뇌에 실감이 잘 안 돼요. 의지가 부족한 게 아니라, 시간을 느끼는 방식이 다른 거예요.

그래서 오늘, 지금, 10분이 필요해요.`,
    note: '출처: 《Driven to Distraction》',
  },
  {
    emoji: '⏱',
    title: '10분 원칙 — 완료가 아니라 시작이 목표예요',
    body: `과제를 시작하기 위해 "하고 싶다"는 감정은 필요 없어요. 딱 시작할 수 있을 만큼의 마음만 있으면 돼요.

최악의 경우라도 10분은 버틸 수 있어요. 10분 후에 계속할지 멈출지 그때 결정해요.

일단 시작하면 기분이 달라져요.`,
    note: '출처: 《성인 ADHD의 대처기술 안내서》',
  },
  {
    emoji: '📤',
    title: '브레인 덤프 — 머릿속을 밖으로 꺼내야 해요',
    body: `ADHD 뇌는 작업 기억이 약해서 여러 생각이 동시에 떠다녀요. 머릿속에서 뱅뱅 도는 생각은 실행을 방해해요.

종이 밖으로 꺼내면 뇌가 그걸 잡고 있지 않아도 돼요. 실행 모드로 전환되는 거예요.

잘 쓸 필요 없어요. 생각나는 대로 다 털어내면 돼요.`,
    note: '출처: 《성인 ADHD의 대처기술 안내서》',
  },
  {
    emoji: '✍️',
    title: '포스트잇에 손으로 쓰는 이유가 있어요',
    body: `손으로 직접 쓰는 행동이 뇌의 기억 저장을 강화해요. 타이핑보다 훨씬 더 잘 각인돼요.

눈에 잘 띄는 곳에 붙여두세요. 모니터 옆, 책상 위, 화장실 거울 앞.

"해야지"가 아니라 "지금 이거야"로 만드는 게 포스트잇의 힘이에요.`,
    note: '출처: 《성인 ADHD의 대처기술 안내서》',
  },
  {
    emoji: '📱',
    title: '유튜브가 당기면 — 그건 신호예요',
    body: `회피하고 싶은 충동은 의지 부족이 아니에요. 뇌가 보내는 신호예요.

"유튜브 보고 싶다" → 신호 인식 → 포스트잇 확인 → 3분만 시작.

그래도 어려우면 3분 대체 행동만 해도 돼요. 시작했다는 것 자체가 뇌를 바꿔요.`,
    note: '출처: 《Driven to Distraction》',
  },
  {
    emoji: '🔄',
    title: '중단해도 괜찮아요 — 복귀가 더 중요해요',
    body: `ADHD에게 중요한 건 완주가 아니라 복귀 횟수예요.

중단됐을 때 NFC를 다시 찍으면 돼요. 그 순간이 다시 시작하는 신호예요.

"또 실패했다"가 아니라 "다시 시작한다"예요. 복귀 자체가 실행력이에요.`,
    note: '출처: 《성인 ADHD의 대처기술 안내서》',
  },
]

function GuideContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const [stepIndex, setStepIndex] = useState(0)

  const isLast = stepIndex === STEPS.length - 1
  const step = STEPS[stepIndex]

  function goNext() {
    if (isLast) {
      router.push(from === 'setup' ? '/nfc' : '/brain-dump')
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
        <div key={stepIndex} className="flex-1 flex flex-col animate-fade-in">
          {/* Icon */}
          <div className="text-6xl text-center mb-6">{step.emoji}</div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-800 text-center leading-snug mb-6 px-2">
            {step.title}
          </h2>

          {/* Body */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
              {step.body}
            </p>
            <p className="text-xs text-slate-300 mt-5">{step.note}</p>
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
              onClick={() => router.push(from === 'setup' ? '/nfc' : '/brain-dump')}
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
