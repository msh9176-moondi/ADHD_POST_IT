import { ConvertPlanResponse } from '@/types'

export function mockConvertPlan(brainDump: string): ConvertPlanResponse {
  const firstLine = brainDump.split(/[\n,，。.]/)[0].trim() || '할 일'
  const shortened = firstLine.slice(0, 15)
  return {
    immediateTasks: [firstLine],
    laterTasks: [],
    emotionOrAvoidanceSignals: ['막막한 느낌이 있어요.'],
    recommendedTask: firstLine,
    taskType: 'unknown',
    difficultyLevel: 'medium',
    estimatedStartTime: '10분',
    finalPostitSentence: `${shortened} 파일 열고 첫 줄 쓰기. 10분만.`,
    backupTinyAction: '파일만 열기. 3분만.',
    ifThenPlan: '막막하면 파일만 열기. 3분만.',
    rewardSuggestion: '다 하면 좋아하는 음료 한 잔.',
    reason: '가장 먼저 떠오른 것부터 시작하면 돼요.',
  }
}
