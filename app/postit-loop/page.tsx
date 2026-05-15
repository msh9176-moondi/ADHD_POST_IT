'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConvertTaskResponse, DailyPostitItem, ClassifyDumpResponse } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function PostitLoopPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [items, setItems] = useState<DailyPostitItem[]>([])
  const [converting, setConverting] = useState(false)
  const [currentResult, setCurrentResult] = useState<ConvertTaskResponse | null>(null)
  const [emotionContext, setEmotionContext] = useState<string>('')

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

    setTasks(parsedTasks)
    setItems(parsedItems)
    setCurrentIndex(parsedIndex)

    let emotionCtx = ''
    if (storedClassify) {
      const classify: ClassifyDumpResponse = JSON.parse(storedClassify)
      if (classify.emotionOrAvoidanceSignals?.length > 0) {
        emotionCtx = classify.emotionOrAvoidanceSignals.join(', ')
        setEmotionContext(emotionCtx)
      }
    }

    // 에너지 레벨을 컨텍스트에 추가
    const energyLevel = sessionStorage.getItem('energyLevel')
    if (energyLevel === 'low') {
      emotionCtx = emotionCtx
        ? `${emotionCtx}, 에너지 매우 낮음 (3분 이하 행동으로 줄여줘)`
        : '에너지 매우 낮음 (3분 이하 행동으로 줄여줘)'
      setEmotionContext(emotionCtx)
    }

    // Auto-convert first task
    if (parsedIndex < parsedTasks.length && parsedItems.length <= parsedIndex) {
      convertCurrentTask(parsedTasks[parsedIndex], parsedIndex, emotionCtx)
    }
  }, [])

  async function convertCurrentTask(task: string, index: number, context: string) {
    setConverting(true)
    setCurrentResult(null)
    try {
      const res = await fetch('/api/convert-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, context }),
      })
      const result: ConvertTaskResponse = await res.json()
      setCurrentResult(result)
    } catch {
      setCurrentResult({
        originalTask: task,
        finalPostitSentence: `${task.slice(0, 15)} - 파일 열기. 10분만.`,
        backupTinyAction: '파일만 열기. 3분만.',
        estimatedStartTime: '10분',
        reason: '첫 번째 행동으로 줄였습니다.',
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
      // All done
      router.push('/time-arrange')
    } else {
      sessionStorage.setItem('currentTaskIndex', String(nextIndex))
      setCurrentIndex(nextIndex)
      setCurrentResult(null)
      convertCurrentTask(tasks[nextIndex], nextIndex, emotionContext)
    }
  }

  function handleReconvert() {
    convertCurrentTask(tasks[currentIndex], currentIndex, emotionContext)
  }

  function handleSkip() {
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
    convertCurrentTask(tasks[nextIndex], nextIndex, emotionContext)
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
          <p className="text-sm text-slate-500 mt-1">
            AI가 10분 첫 행동으로 바꿔드려요.
          </p>
        </div>

        {/* Original task */}
        <Card className="mb-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">원래 할 일</p>
            <p className="text-slate-700 text-base leading-snug">{currentTask}</p>
          </div>
        </Card>

        {/* Converting state */}
        {converting && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-amber-700 font-medium">10분 행동으로 줄이는 중...</p>
          </div>
        )}

        {/* Result */}
        {!converting && currentResult && (
          <div className="flex flex-col gap-4 animate-fade-in" key={currentIndex}>
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

            {/* Reward — Premack principle */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <span className="text-xl flex-shrink-0">🎁</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-green-700 mb-0.5">끝내면 바로 해도 돼요</p>
                <p className="text-sm font-medium text-green-800">
                  {currentResult.rewardSuggestion || '좋아하는 것 10분 해도 돼'}
                </p>
              </div>
            </div>

            {/* Backup action */}
            <Card variant="highlight">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-700">너무 막힐 때 대체 행동</p>
                <p className="text-sm text-slate-700">{currentResult.backupTinyAction}</p>
              </div>
            </Card>

            {/* Reason */}
            <Card>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">왜 이렇게 줄였나요?</p>
                <p className="text-xs text-slate-500 leading-relaxed">{currentResult.reason}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Buttons */}
        {!converting && currentResult && (
          <div className="space-y-2.5 mt-6 safe-bottom">
            <Button onClick={handleAccept}>
              이 포스트잇 사용하기 →
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleReconvert}
              >
                다시 줄이기
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleSkip}
              >
                이 항목 건너뛰기
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
