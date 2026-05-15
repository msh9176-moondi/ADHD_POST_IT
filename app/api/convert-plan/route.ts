import { NextRequest, NextResponse } from 'next/server'
import { convertPlan } from '@/lib/ai/convertPlan'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brainDump } = body

    if (!brainDump || typeof brainDump !== 'string') {
      return NextResponse.json({ error: 'brainDump required' }, { status: 400 })
    }

    const result = await convertPlan(brainDump.trim())
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: '처리 중 문제가 발생했어요. 다시 시도해볼까요?' },
      { status: 500 }
    )
  }
}
