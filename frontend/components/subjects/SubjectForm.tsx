'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubjects } from '@/hooks/useSubjects'
import { SUBJECT_COLORS, SUBJECT_ICONS } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  subject?: any
  onClose?: () => void
  onSave?: () => void
  onSuccess?: () => void
  onCancel?: () => void
}

export default function SubjectForm({ subject, onClose, onSave, onSuccess, onCancel }: Props) {
  const handleClose = onCancel || onClose || (() => {})
  const handleSaveSuccess = onSuccess || onSave || (() => {})
  const { t, isRTL } = useTranslation()
  const { createSubject, editSubject } = useSubjects()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: subject?.name || '',
    color: subject?.color || '#6C63FF',
    icon: subject?.icon || '📚',
    exam_date: subject?.exam_date ? new Date(subject.exam_date).toISOString().slice(0, 10) : '',
    reminder_enabled: subject?.reminder_enabled ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      const data = {
        ...form,
        exam_date: form.exam_date ? new Date(form.exam_date).toISOString() : null,
      }
      if (subject) {
        await editSubject(subject.id, data)
        toast.success(t('subjects.updated'))
      } else {
        await createSubject(data)
        toast.success(t('subjects.created'))
      }
      handleSaveSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass rounded-2xl shadow-glow overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
          <h2 className="font-bold text-text-primary">
            {subject ? t('subjects.editSubject') : t('subjects.newSubject')}
          </h2>
          <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('subjects.name')}</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('subjects.namePlaceholder')}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('subjects.icon')}</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-xl text-xl transition-all ${form.icon === icon ? 'bg-primary/30 ring-2 ring-primary' : 'bg-surface-2 hover:bg-surface'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('subjects.colorLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-7 h-7 rounded-lg transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">{t('subjects.examDate')}</label>
            <input
              type="date"
              value={form.exam_date}
              onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-surface-2 hover:bg-surface text-text-secondary rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('common.save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
