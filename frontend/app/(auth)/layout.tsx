'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
        <div className="w-full max-w-md" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
