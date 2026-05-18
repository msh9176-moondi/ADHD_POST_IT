'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/brain-dump') }, [])
  return null
}
