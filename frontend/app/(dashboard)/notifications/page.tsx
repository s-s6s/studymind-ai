'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Calendar, BookOpen } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
  const { t, isRTL } = useTranslation()
  const { notifications, loading, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const getIcon = (type: string) => {
    if (type === 'exam_reminder') return Calendar
    if (type === 'content_ready') return BookOpen
    return Bell
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary" />
            {t('notifications.title')}
          </h1>
          {unreadCount > 0 && (
            <p className="text-text-secondary text-sm mt-1">
              {unreadCount} {t('notifications.unread')}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <CheckCheck className="w-4 h-4" />
            {t('notifications.markAllRead')}
          </button>
        )}
      </motion.div>

      {/* Notifications list */}
      <div className="space-y-2">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Bell className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          notifications.map((n: any, i: number) => {
            const Icon = getIcon(n.type)
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`glass rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:border-primary/30 transition-all ${
                  !n.is_read ? 'border-primary/40 bg-primary/5' : 'opacity-70'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  !n.is_read ? 'bg-primary/20' : 'bg-surface-2'
                }`}>
                  <Icon className={`w-4 h-4 ${!n.is_read ? 'text-primary' : 'text-text-secondary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.is_read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{n.body}</p>
                  )}
                  <p className="text-xs text-text-secondary/60 mt-1">{getTimeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
