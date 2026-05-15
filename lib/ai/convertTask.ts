import OpenAI from 'openai'
import { ConvertTaskResponse } from '@/types'

const SYSTEM_PROMPT = `너는 성인 ADHD 사용자의 할 일 하나를 10분 첫 행동 포스트잇 문장으로 바꾸는 AI다.

원칙:
1. 진단, 치료, 약물 조언을 하지 않는다.
2. 사용자를 의지 부족으로 해석하지 않는다.
3. 반드시 10분 이하 첫 행동으로 줄인다.
4. 행동동사를 포함한다. (열기, 쓰기, 확인하기, 꺼내기, 보내기 등)
5. 포스트잇에 적을 수 있을 만큼 짧게.
6. 완료가 아닌 시작 기준.
7. 막막함·피로 신호가 있으면 3분 행동으로 줄인다.
8. 프리맥 원리: 이 행동을 마친 후 즐길 수 있는 소소한 보상을 제안한다. 구체적이고 즉각적인 것으로 (예: "유튜브 10분", "좋아하는 음악 한 곡", "커피 한 잔", "간식 하나").

좋은 문장: "파일 열고 제목 1줄 쓰기. 10분만."
나쁜 문장: "사업계획서 쓰기", "포트폴리오 하기"

반드시 JSON만 출력한다:
{
  "finalPostitSentence": "포스트잇에 적을 문장",
  "backupTinyAction": "너무 막힐 때 3분 대체 행동",
  "estimatedStartTime": "3분 또는 5분 또는 10분",
  "reason": "왜 이 문장으로 줄였는지 짧은 설명",
  "rewardSuggestion": "이 행동을 마치면 허락할 소소한 보상 (15자 이내, 예: '유튜브 10분 봐도 돼')"
}`

function mockConvert(task: string): ConvertTaskResponse {
  return {
    originalTask: task,
    finalPostitSentence: `${task.slice(0, 10)} 파일 열고 첫 줄만 쓰기. 10분만.`,
    backupTinyAction: `파일만 열기. 3분만.`,
    estimatedStartTime: '10분',
    reason: '전체 작업은 크기 때문에 파일을 열고 첫 줄을 쓰는 행동으로 줄였습니다.',
    rewardSuggestion: '유튜브 10분 봐도 돼',
  }
}

export async function convertTask(task: string, context?: string): Promise<ConvertTaskResponse> {
  if (!process.env.OPENAI_API_KEY) return mockConvert(task)
  try {
    const openai = new OpenAI()
    const userMsg = context
      ? `할 일: ${task}\n\n현재 감정/상태 맥락: ${context}`
      : `할 일: ${task}`
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })
    const raw = JSON.parse(completion.choices[0].message.content || '{}')
    return { ...raw, originalTask: task } as ConvertTaskResponse
  } catch {
    return mockConvert(task)
  }
}
