'use client'
import { useCallback } from 'react'
import { notificationsApi } from '@/lib/api'
import { useNotificationStore } from '@/store/useNotificationStore'

export function useNotifications() {
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useNotificationStore()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll()
      setNotifications(res.data)
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }, [setNotifications])

  const markAsRead = async (id: string) => {
    await notificationsApi.markRead(id)
    markRead(id)
  }

  const markAllAsRead = async () => {
    await notificationsApi.markAllRead()
    markAllRead()
  }

  return {
    notifications,
    unreadCount,
    loading: false,
    fetchNotifications,
    markRead: markAsRead,
    markAsRead,
    markAllRead: markAllAsRead,
    markAllAsRead,
  }
}
