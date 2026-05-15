import { RewardType, REWARD_XP } from '@/types'

export async function grantXP(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rewardType: RewardType
): Promise<{ granted: boolean; xp: number }> {
  const today = new Date().toISOString().slice(0, 10)

  // Check if already rewarded today
  const { data: existing } = await supabase
    .from('reward_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('reward_type', rewardType)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`)
    .single()

  if (existing) return { granted: false, xp: 0 }

  const xp = REWARD_XP[rewardType]

  // Insert reward log
  await supabase.from('reward_logs').insert({
    user_id: userId,
    reward_type: rewardType,
    xp,
  })

  // Update total_xp
  await supabase.rpc('increment_xp', { user_id_input: userId, xp_input: xp })

  return { granted: true, xp }
}
