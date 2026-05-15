import { NextRequest, NextResponse } from 'next/server'
import { convertTask } from '@/lib/ai/convertTask'

export async function POST(req: NextRequest) {
  const { task, context } = await req.json()
  if (!task?.trim()) {
    return NextResponse.json({ error: 'task is required' }, { status: 400 })
  }
  const result = await convertTask(task.trim(), context)
  return NextResponse.json(result)
}
