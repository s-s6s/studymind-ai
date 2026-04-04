'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, Trash2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { aiApi } from '@/lib/api'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export default function ChatInterface({ subjectId, chapterId }: {
  subjectId: string
  chapterId?: string
}) {
  const { t, isRTL } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadHistory()
  }, [subjectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await aiApi.getChatHistory(subjectId)
      setMessages(res.data.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
      })))
    } catch {}
    setLoadingHistory(false)
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiApi.chat({
        subject_id: subjectId,
        chapter_id: chapterId,
        message: text,
        history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      })
      const aiMsg: Message = {
        role: 'assistant',
        content: res.data.message || res.data.response || '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.aiError'))
      // Remove user message on failure
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="glass rounded-2xl overflow-hidden flex flex-col"
      style={{ height: '520px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-text-primary text-sm">{t('outputs.aiAssistant')}</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
        <button
          onClick={() => setMessages([])}
          className="text-text-secondary hover:text-red-400 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <p className="text-text-secondary text-sm">{t('chat.noHistory')}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-primary" />
                    : <Bot className="w-4 h-4 text-accent" />
                  }
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? (isRTL ? 'items-start' : 'items-end') : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-surface-2 text-text-primary rounded-tl-sm border border-border'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <span className="text-xs text-text-secondary/50 mt-0.5 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-surface-2 border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-end gap-2 bg-surface-2 rounded-xl border border-border p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-text-primary placeholder-text-secondary text-sm resize-none focus:outline-none min-h-[36px] max-h-[120px]"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-lg bg-primary hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
          >
            {loading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
        <p className="text-xs text-text-secondary/50 mt-1 text-center">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
