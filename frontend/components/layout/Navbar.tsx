'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { t, isRTL } = useTranslation()
  const { user } = useAuthStore()

  // Get page title from path
  const pathname = usePathname()
  const getTitle = () => {
    if (pathname === '/dashboard') return t('nav.dashboard')
    if (pathname.startsWith('/subjects')) return t('nav.subjects')
    if (pathname.startsWith('/progress')) return t('nav.progress')
    if (pathname.startsWith('/notifications')) return t('nav.notifications')
    if (pathname.startsWith('/settings')) return t('nav.settings')
    return 'StudyMind AI'
  }

  return (
    <header className="h-16 bg-surface border-b flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40"
      style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
      <div className="flex-1">
        <h1 className="text-lg font-bold text-text-primary">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <NotificationBell />
        <Link href="/settings" className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </Link>
      </div>
    </header>
  )
}
