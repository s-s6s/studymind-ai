'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, TrendingUp, Bell, Settings } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotificationStore } from '@/store/useNotificationStore'

export default function BottomNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { unreadCount } = useNotificationStore()

  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/subjects', icon: BookOpen, label: t('nav.subjects') },
    { href: '/progress', icon: TrendingUp, label: t('nav.progress') },
    { href: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadCount },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t"
      style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
