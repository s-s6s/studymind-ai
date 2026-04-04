'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Layers, FileText, Loader2, Brain } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { filesApi } from '@/lib/api'
import { toast } from 'sonner'

interface Props {
  fileId: string
  subjectId: string
  onClose: () => void
  onSuccess: (fileId: string) => void
}

export default function ChapterSplitDialog({ fileId, subjectId, onClose, onSuccess }: Props) {
  const { t, isRTL } = useTranslation()
  const [loading, setLoading] = useState(false)

  const handleChoice = async (split: boolean) => {
    setLoading(true)
    try {
      await filesApi.detectChapters(fileId, split)
      toast.success(t('common.success'))
      onSuccess(fileId)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.generic'))
      onSuccess(fileId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-2xl shadow-glow"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
          <h2 className="font-bold text-text-primary">{t('chapters.splitQuestion')}</h2>
          <button onClick={onClose} disabled={loading}><X className="w-5 h-5 text-text-secondary" /></button>
        </div>

        <div className="p-6">
          <p className="text-text-secondary text-sm mb-6">{t('chapters.splitDesc')}</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleChoice(true)}
              disabled={loading}
              className="glass-2 rounded-xl p-5 text-center hover:border-primary transition-all disabled:opacity-50 hover:shadow-glow"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              ) : (
                <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              )}
              <p className="font-medium text-text-primary text-sm">{t('chapters.splitFile')}</p>
              <p className="text-xs text-text-secondary mt-1">{loading ? t('chapters.detecting') : ''}</p>
            </button>

            <button
              onClick={() => handleChoice(false)}
              disabled={loading}
              className="glass-2 rounded-xl p-5 text-center hover:border-accent transition-all disabled:opacity-50"
            >
              <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="font-medium text-text-primary text-sm">{t('chapters.keepAsOne')}</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
