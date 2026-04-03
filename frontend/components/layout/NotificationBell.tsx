'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDate } from '@/lib/utils'

export default function NotificationBell() {
  const { t, isRTL } = useTranslation()
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-2 transition-colors text-text-secondary hover:text-text-primary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-80 bg-surface border rounded-2xl shadow-glow overflow-hidden z-50`}
            style={{ borderColor: 'rgba(108,99,255,0.2)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
              <span className="font-semibold text-text-primary text-sm">{t('notifications.title')}</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-text-secondary text-sm">
                  {t('notifications.noNotifications')}
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`px-4 py-3 border-b cursor-pointer hover:bg-surface-2 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                    style={{ borderColor: 'rgba(108,99,255,0.1)' }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                      <div className={!n.is_read ? '' : 'ms-4'}>
                        <p className="text-sm font-medium text-text-primary">{n.title}</p>
                        {n.body && <p className="text-xs text-text-secondary mt-0.5">{n.body}</p>}
                        <p className="text-xs text-text-secondary mt-1">{formatDate(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
              <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">
                {t('common.view')} {t('nav.notifications')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
