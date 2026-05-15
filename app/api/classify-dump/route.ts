import { NextRequest, NextResponse } from 'next/server'
import { classifyDump } from '@/lib/ai/classifyDump'

export async function POST(req: NextRequest) {
  const { brainDump } = await req.json()
  if (!brainDump?.trim()) {
    return NextResponse.json({ error: 'brainDump is required' }, { status: 400 })
  }
  const result = await classifyDump(brainDump.trim())
  return NextResponse.json(result)
}
