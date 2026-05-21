export type EnergyLevel = 'low' | 'mid' | 'high'

export interface EnergyConfig {
  emoji: string
  label: string
  desc: string
  maxSelect: number
  recommendedMax: number
  guideText: string
  warningText: string
  color: string
  bg: string
  border: string
}

export const ENERGY_CONFIG: Record<EnergyLevel, EnergyConfig> = {
  low: {
    emoji: '🔴',
    label: '방전됨',
    desc: '의욕이 거의 없고 지쳐있어요',
    maxSelect: 2,
    recommendedMax: 1,
    guideText: '오늘은 딱 1~2개만 해요. 가장 쉬운 것 하나면 충분해요.',
    warningText: '방전 상태에서는 1개가 최선이에요. 돌아올 수 있는 게 목표예요.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  mid: {
    emoji: '🟡',
    label: '보통이에요',
    desc: '그럭저럭 할 수 있을 것 같아요',
    maxSelect: 3,
    recommendedMax: 2,
    guideText: '2~3개를 권장해요. 무리하지 않는 선에서 골라보세요.',
    warningText: '많이 적는 것보다 돌아올 수 있게 만드는 것이 목표예요.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  high: {
    emoji: '🟢',
    label: '에너지 충분',
    desc: '오늘은 잘 할 수 있을 것 같아요',
    maxSelect: 5,
    recommendedMax: 3,
    guideText: '최대 5개까지 선택할 수 있어요. 어려운 것도 도전해봐요.',
    warningText: '3개 이상은 욕심일 수 있어요. 한 번 더 생각해봐요.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
}
