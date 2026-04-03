'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from '@/hooks/useTranslation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const { dir } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useWebSocket()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, mounted])

  // Prevent hydration mismatch — show nothing until client-side
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen" dir={dir}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
