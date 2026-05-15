import OpenAI from 'openai'
import { ClassifyDumpResponse } from '@/types'

const SYSTEM_PROMPT = `너는 성인 ADHD 사용자의 브레인 덤프를 분류하는 AI다.

사용자가 자유롭게 적은 브레인 덤프를 4가지로 분류한다.

핵심 원칙:
- "~해야 하는데 귀찮다", "~하기 싫다", "~못 하고 있다" → 감정이 섞여 있어도 할 일이 내재되어 있으면 taskCandidates에 추출한다.
- 할 일과 감정은 동시에 분류할 수 있다. 같은 문장에서 할 일도, 감정 신호도 각각 추출한다.
- 할 일이 전혀 없는 순수 감정 표현만 emotionOrAvoidanceSignals에 넣는다. (예: "그냥 우울해", "아무것도 하기 싫어")
- 할 일은 원래 표현 그대로 두되, 명사형으로 짧게 정리한다. (예: "책 읽기", "보고서 초안 작성")
- 큰 목표도 분해하지 않는다.

분류 기준:
1. fixedSchedule: 오늘 이미 시간이 정해진 일정 (예: "오후 3시 약속", "저녁 회의")
2. taskCandidates: 오늘 실행 가능한 일들. 최대 7개. 감정이 섞여도 할 일이 보이면 반드시 추출한다.
   - "책 읽어야 하는데 귀찮다" → "책 읽기"
   - "운동 못 하고 있음" → "운동하기"
   - "청소해야 함" → "청소하기"
3. emotionOrAvoidanceSignals: 감정, 회피 신호, 피로감, 자기비난 (할 일이 있어도 함께 기록)
   - "귀찮다", "막막하다", "하기 싫다", "지쳤다"
4. energyNotes: 에너지·시간 관련 힌트 (예: "저녁에는 피곤할 것 같음", "오전에 집중 잘 됨")

반드시 JSON만 출력한다. 설명 없이.
{
  "fixedSchedule": [],
  "taskCandidates": [],
  "emotionOrAvoidanceSignals": [],
  "energyNotes": []
}`

function mockClassify(brainDump: string): ClassifyDumpResponse {
  const lines = brainDump.split(/[\n,]/).map(l => l.trim()).filter(Boolean)
  return {
    fixedSchedule: [],
    taskCandidates: lines.slice(0, 5),
    emotionOrAvoidanceSignals: ['막막함'],
    energyNotes: [],
  }
}

export async function classifyDump(brainDump: string): Promise<ClassifyDumpResponse> {
  if (!process.env.OPENAI_API_KEY) return mockClassify(brainDump)
  try {
    const openai = new OpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `브레인 덤프:\n${brainDump}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })
    return JSON.parse(completion.choices[0].message.content || '{}') as ClassifyDumpResponse
  } catch {
    return mockClassify(brainDump)
  }
}
