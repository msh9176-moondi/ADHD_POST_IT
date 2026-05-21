import { SupabaseClient } from '@supabase/supabase-js'
import { RewardType, REWARD_XP } from '@/types'

export async function grantXP(
  supabase: SupabaseClient,
  userId: string,
  rewardType: RewardType
): Promise<{ granted: boolean; xp: number }> {
  const today = new Date().toISOString().slice(0, 10)
  const nextDay = new Date()
  nextDay.setDate(nextDay.getDate() + 1)
  const tomorrow = nextDay.toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('reward_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('reward_type', rewardType)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${tomorrow}T00:00:00`)
    .single()

  if (existing) return { granted: false, xp: 0 }

  const xp = REWARD_XP[rewardType]

  await supabase.from('reward_logs').insert({ user_id: userId, reward_type: rewardType, xp })
  await supabase.rpc('increment_xp', { user_id_input: userId, xp_input: xp })

  return { granted: true, xp }
}
