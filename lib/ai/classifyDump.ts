import OpenAI from 'openai'
import { ClassifyDumpResponse } from '@/types'

const SYSTEM_PROMPT = `너는 성인 ADHD 사용자의 브레인 덤프를 분류하는 AI다.

ADHD 사용자는 종종 단어 하나, 감정 섞인 짧은 문장만 적는다. 이것은 정상이다.
절대로 "할 일이 없다"고 판단하지 않는다. 행동으로 해석 가능한 키워드가 하나라도 있으면 반드시 taskCandidates에 넣는다.

키워드 → 할 일 변환 원칙:
- "마감", "데드라인" → "마감 준비하기"
- "과제", "숙제", "레포트", "리포트" → "과제 하기"
- "청소", "정리", "치우기" → "청소하기"
- "연락", "답장", "문자", "카톡", "전화" → "연락하기"
- "운동", "헬스", "산책" → "운동하기"
- "공부", "복습", "예습" → "공부하기"
- "회의", "미팅", "약속" → 해당 일정으로 분류
- "장보기", "쇼핑", "마트" → "장보기"
- "책", "독서" → "책 읽기"
- 위 패턴처럼 행동 가능한 명사 → "~하기" 형태로 변환해 taskCandidates에 추가

감정 + 과제 처리:
- "마감인데 막막해" → taskCandidates: "마감 준비하기", emotionOrAvoidanceSignals: "막막함"
- "청소 하기 싫다" → taskCandidates: "청소하기", emotionOrAvoidanceSignals: "하기 싫음"
- "운동 못 하고 있음" → taskCandidates: "운동하기"
- 감정이 섞여도 행동 대상이 보이면 taskCandidates에 반드시 넣는다.
- 순수 감정만 있을 때만 emotionOrAvoidanceSignals 단독 분류: "피곤", "우울", "불안", "짜증"

분류 기준:
1. fixedSchedule: 오늘 시간이 정해진 일정 (예: "오후 3시 약속", "저녁 회의")
2. taskCandidates: 오늘 실행 가능한 모든 행동. 최대 7개. 명사형으로 짧게.
3. emotionOrAvoidanceSignals: 행동 대상 없는 순수 감정·회피 신호 ("귀찮다", "막막하다", "지쳤다", "피곤")
4. energyNotes: 에너지·시간 힌트 ("저녁엔 피곤할 것 같음", "오전에 집중 잘 됨", "오늘 컨디션 별로")

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
