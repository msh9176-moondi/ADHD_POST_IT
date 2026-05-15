export interface Profile {
  id: string
  nickname: string | null
  plan_time: string | null
  total_xp: number
  created_at: string
}

export interface NfcLog {
  id: string
  user_id: string
  accessed_at: string
  reward_given: boolean
}

export interface BrainDump {
  id: string
  user_id: string
  content: string
  created_at: string
}

export interface PlanSentence {
  id: string
  user_id: string
  brain_dump_id: string
  original_task: string
  final_sentence: string
  created_at: string
  written_confirmed: boolean
}

export interface RewardLog {
  id: string
  user_id: string
  reward_type: string
  xp: number
  created_at: string
}

export interface DailyStat {
  id: string
  user_id: string
  date: string
  nfc_count: number
  brain_dump_count: number
  plan_sentence_count: number
  xp_earned: number
}

export interface ClassifyDumpResponse {
  fixedSchedule: string[]
  taskCandidates: string[]
  emotionOrAvoidanceSignals: string[]
  energyNotes: string[]
}

export interface ConvertTaskResponse {
  originalTask: string
  finalPostitSentence: string
  backupTinyAction: string
  estimatedStartTime: string
  reason: string
  rewardSuggestion: string
}

export interface DailyPostitItem {
  id: string
  order: number
  originalTask: string
  finalPostitSentence: string
  backupTinyAction: string
  estimatedStartTime: string
  startTime?: string
  priority?: 'red' | 'yellow' | 'green'
}

export interface ConvertPlanResponse {
  immediateTasks: string[]
  laterTasks: string[]
  emotionOrAvoidanceSignals: string[]
  recommendedTask: string
  taskType: 'work' | 'study' | 'health' | 'home' | 'admin' | 'relationship' | 'recovery' | 'unknown'
  difficultyLevel: 'very_easy' | 'easy' | 'medium'
  estimatedStartTime: '3분' | '5분' | '10분'
  finalPostitSentence: string
  backupTinyAction: string
  ifThenPlan: string
  rewardSuggestion: string
  reason: string
}

export type RewardType = 'nfc_tag' | 'brain_dump' | 'plan_sentence' | 'postit_written' | 'return_bonus'

export const REWARD_XP: Record<RewardType, number> = {
  nfc_tag: 10,
  brain_dump: 10,
  plan_sentence: 20,
  postit_written: 20,
  return_bonus: 30,
}
