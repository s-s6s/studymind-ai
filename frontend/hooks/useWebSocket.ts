'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useNotificationStore } from '@/store/useNotificationStore'
import { getToken } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const reconnectDelay = useRef(1000)
  const { addNotification } = useNotificationStore()

  const connect = useCallback(() => {
    const token = getToken()
    if (!token) return

    const wsUrl = API_URL.replace('http', 'ws') + `/ws/notifications?token=${token}`

    try {
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        reconnectDelay.current = 1000
        // Ping every 30s to keep alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current?.send('ping')
          }
        }, 30000)
        if (ws.current) ws.current.onclose = () => clearInterval(pingInterval)
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'notification') {
            addNotification({
              id: data.id,
              type: data.notification_type,
              title: data.title,
              body: data.body,
              is_read: false,
              created_at: new Date().toISOString(),
            })
          }
        } catch (e) {}
      }

      ws.current.onclose = () => {
        // Exponential backoff reconnect
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000)
          connect()
        }, reconnectDelay.current)
      }

      ws.current.onerror = () => {
        ws.current?.close()
      }
    } catch (e) {}
  }, [addNotification])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  return { ws }
}
