'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, TrendingUp,
  Bell, Settings, Brain, LogOut, ChevronRight
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { clearTokens } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const { t, isRTL } = useTranslation()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/subjects', icon: BookOpen, label: t('nav.subjects') },
    { href: '/progress', icon: TrendingUp, label: t('nav.progress') },
    { href: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadCount },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const handleLogout = () => {
    clearTokens()
    logout()
    router.push('/login')
  }

  return (
    <div className={`w-64 min-h-screen bg-surface border-border flex flex-col ${isRTL ? 'border-l' : 'border-r'}`}
      style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">StudyMind AI</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ms-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className={`absolute inset-0 rounded-xl bg-primary/10 border border-primary/30 -z-10`}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
        >
          <LogOut className="w-5 h-5" />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}
