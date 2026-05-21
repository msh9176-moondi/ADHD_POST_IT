'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConvertTaskResponse, DailyPostitItem, ClassifyDumpResponse } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

export default function PostitLoopPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [items, setItems] = useState<DailyPostitItem[]>([])
  const [converting, setConverting] = useState(false)
  const [currentResult, setCurrentResult] = useState<ConvertTaskResponse | null>(null)
  const [emotionContext, setEmotionContext] = useState<string>('')
  const [taskContexts, setTaskContexts] = useState<Record<string, string>>({})
  const [shrinkLevel, setShrinkLevel] = useState(0)
  const [cantDoOpen, setCantDoOpen] = useState(false)

  useEffect(() => {
    const storedTasks = sessionStorage.getItem('selectedTasks')
    const storedItems = sessionStorage.getItem('postitItems')
    const storedIndex = sessionStorage.getItem('currentTaskIndex')
    const storedClassify = sessionStorage.getItem('classifyResult')

    if (!storedTasks) {
      router.replace('/brain-dump')
      return
    }

    const parsedTasks: string[] = JSON.parse(storedTasks)
    const parsedItems: DailyPostitItem[] = storedItems ? JSON.parse(storedItems) : []
    const parsedIndex = storedIndex ? parseInt(storedIndex, 10) : 0
    const parsedContexts: Record<string, string> = sessionStorage.getItem('taskContexts')
      ? JSON.parse(sessionStorage.getItem('taskContexts')!)
      : {}

    setTasks(parsedTasks)
    setItems(parsedItems)
    setCurrentIndex(parsedIndex)
    setTaskContexts(parsedContexts)

    let emotionCtx = ''
    if (storedClassify) {
      const classify: ClassifyDumpResponse = JSON.parse(storedClassify)
      if (classify.emotionOrAvoidanceSignals?.length > 0) {
        emotionCtx = classify.emotionOrAvoidanceSignals.join(', ')
        setEmotionContext(emotionCtx)
      }
    }

    const energyLevel = sessionStorage.getItem('energyLevel')
    if (energyLevel === 'low') {
      emotionCtx = emotionCtx
        ? `${emotionCtx}, 에너지 매우 낮음 (3분 이하 행동으로 줄여줘)`
        : '에너지 매우 낮음 (3분 이하 행동으로 줄여줘)'
      setEmotionContext(emotionCtx)
    }

    if (parsedIndex < parsedTasks.length && parsedItems.length <= parsedIndex) {
      const taskCtx = parsedContexts[parsedTasks[parsedIndex]] || ''
      convertTask(parsedTasks[parsedIndex], taskCtx, emotionCtx, 0)
    }
  }, [])

  async function convertTask(task: string, taskContext: string, emotionCtx: string, shrink: number) {
    setConverting(true)
    setCurrentResult(null)
    setShrinkLevel(shrink)
    setCantDoOpen(false)

    let shrinkHint = ''
    if (shrink === 1) {
      shrinkHint = '더 구체적인 첫 행동으로 바꿔줘. 예: "청소하기" → "청소도구 꺼내기", "공부하기" → "교재 47페이지 펴기"처럼 실제로 무엇을 할지 명확하게'
    } else if (shrink === 2) {
      shrinkHint = '한 단계 더 구체적으로. 손이 실제로 어디에 닿는지, 무엇을 집는지까지 보이는 문장으로'
    } else if (shrink >= 3) {
      shrinkHint = `지금까지 나온 문장보다 더 구체적으로. 장소, 도구, 행동이 모두 명확한 한 문장으로. 변환 ${shrink}회차`
    }
    const emotionFull = [emotionCtx, shrinkHint].filter(Boolean).join('. ')

    try {
      const res = await fetch('/api/convert-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, taskContext, emotionContext: emotionFull }),
      })
      const result: ConvertTaskResponse = await res.json()
      setCurrentResult(result)
    } catch {
      setCurrentResult({
        originalTask: task,
        finalPostitSentence: '타이머 켜고 3분만 앉아 있기.',
        backupTinyAction: '타이머만 켜기.',
        estimatedStartTime: '3분',
        reason: '시작이 목표예요.',
        rewardSuggestion: '유튜브 10분 봐도 돼',
      })
    } finally {
      setConverting(false)
    }
  }

  function handleAccept() {
    if (!currentResult) return
    const taskPriorities = JSON.parse(sessionStorage.getItem('taskPriorities') || '{}')
    const priority = taskPriorities[currentResult.originalTask] ?? 'yellow'
    const newItem: DailyPostitItem = {
      id: `item-${Date.now()}`,
      order: items.length + 1,
      originalTask: currentResult.originalTask,
      finalPostitSentence: currentResult.finalPostitSentence,
      backupTinyAction: currentResult.backupTinyAction,
      estimatedStartTime: currentResult.estimatedStartTime,
      priority,
    }
    const newItems = [...items, newItem]
    setItems(newItems)
    sessionStorage.setItem('postitItems', JSON.stringify(newItems))

    const nextIndex = currentIndex + 1
    if (nextIndex >= tasks.length) {
      router.push('/time-arrange')
    } else {
      sessionStorage.setItem('currentTaskIndex', String(nextIndex))
      setCurrentIndex(nextIndex)
      setCurrentResult(null)
      setShrinkLevel(0)
      convertTask(tasks[nextIndex], taskContexts[tasks[nextIndex]] || '', emotionContext, 0)
    }
  }

  function handleShrink() {
    convertTask(tasks[currentIndex], taskContexts[tasks[currentIndex]] || '', emotionContext, shrinkLevel + 1)
  }

  function handleUseBackup() {
    if (!currentResult) return
    setCurrentResult({
      ...currentResult,
      finalPostitSentence: currentResult.backupTinyAction,
      estimatedStartTime: '3분',
      reason: '더 작은 대체 행동으로 시작해요.',
    })
    setCantDoOpen(false)
  }

  function handleSkip() {
    setCantDoOpen(false)
    const nextIndex = currentIndex + 1
    if (nextIndex >= tasks.length) {
      if (items.length > 0) {
        router.push('/time-arrange')
      } else {
        router.push('/task-select')
      }
      return
    }
    sessionStorage.setItem('currentTaskIndex', String(nextIndex))
    setCurrentIndex(nextIndex)
    setCurrentResult(null)
    setShrinkLevel(0)
    convertTask(tasks[nextIndex], taskContexts[tasks[nextIndex]] || '', emotionContext, 0)
  }

  function handleStopForToday() {
    if (items.length > 0) {
      router.push('/time-arrange')
    } else {
      router.push('/profile')
    }
  }

  if (tasks.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  const currentTask = tasks[currentIndex]
  const total = tasks.length
  const done = items.length

  return (
    <AppShell>
      <div className="flex flex-col py-6 animate-fade-in">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            {tasks.map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 flex-1 rounded-full transition-all',
                  i < done ? 'bg-amber-400' : i === currentIndex ? 'bg-amber-300' : 'bg-slate-200',
                ].join(' ')}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">포스트잇 만들기</h1>
            <span className="text-sm text-slate-400">{Math.min(done + 1, total)} / {total}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">AI가 10분 첫 행동으로 바꿔드려요.</p>
        </div>

        {/* Original task */}
        <div className="mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">원래 할 일</p>
          <p className="text-slate-700 text-base leading-snug">{currentTask}</p>
          {taskContexts[currentTask] && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-1">
              💬 {taskContexts[currentTask]}
            </p>
          )}
        </div>

        {/* Converting state */}
        {converting && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-amber-700 font-medium">
              {shrinkLevel === 0 ? '10분 행동으로 변환하는 중...' : '다시 변환하는 중...'}
            </p>
          </div>
        )}

        {/* Result */}
        {!converting && currentResult && (
          <div className="flex flex-col gap-4 animate-fade-in" key={`${currentIndex}-${shrinkLevel}`}>
            {/* Shrink level indicator */}
            {shrinkLevel > 0 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                shrinkLevel === 1 ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
              }`}>
                <span>🔄</span>
                <span>{`더 구체적으로 변환했어요 (${shrinkLevel}회)`}</span>
              </div>
            )}

            {/* Postit */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-200 rounded-2xl translate-x-1.5 translate-y-1.5" />
              <div className="relative bg-amber-300 rounded-2xl p-6 shadow-postit">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-500 rounded-full shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-amber-200 rounded-full" />
                </div>
                <p className="text-slate-800 text-xl font-bold leading-snug text-center">
                  {currentResult.finalPostitSentence}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-xs bg-amber-400/50 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    {currentResult.estimatedStartTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!converting && currentResult && (
          <div className="space-y-2.5 mt-6 safe-bottom">
            <Button onClick={handleAccept}>
              이 포스트잇 사용하기 →
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" size="md" className="flex-1" onClick={handleShrink}>
                다시 변환하기 🔄
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => setCantDoOpen(true)}
              >
                지금 못 하겠어요
              </Button>
            </div>
          </div>
        )}

        {/* 지금 못 하겠어요 패널 */}
        {cantDoOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setCantDoOpen(false)}>
            <div
              className="bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 max-w-[430px] mx-auto w-full animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">괜찮아요.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  지금은 너무 클 수 있어요.<br />더 작은 것부터 시작할 수 있어요.
                </p>
              </div>

              {currentResult && (
                <button
                  onClick={handleUseBackup}
                  className="w-full text-left px-4 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl hover:border-amber-400 transition-all"
                >
                  <p className="text-xs font-semibold text-amber-700 mb-1">대신 이것만 해볼게요</p>
                  <p className="text-base font-bold text-slate-800">{currentResult.backupTinyAction}</p>
                </button>
              )}

              <button
                onClick={handleShrink}
                className="w-full py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-slate-300 transition-all"
              >
                다시 변환하기 🔄
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 text-sm text-slate-500 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all font-medium"
                >
                  이 항목 건너뛰기
                </button>
                <button
                  onClick={handleStopForToday}
                  className="flex-1 py-3 text-sm text-slate-500 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all font-medium"
                >
                  오늘은 여기까지
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
