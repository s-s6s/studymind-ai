'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Plus, Calendar, Trophy, Pencil,
  Upload, Brain, ChevronRight, Loader2, Layers
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useChapters } from '@/hooks/useChapters'
import { subjectsApi } from '@/lib/api'
import { useSubjectStore } from '@/store/useSubjectStore'
import ChapterList from '@/components/chapters/ChapterList'
import FileUpload from '@/components/chapters/FileUpload'
import SubjectForm from '@/components/subjects/SubjectForm'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function SubjectDetailPage() {
  const { subjectId } = useParams() as { subjectId: string }
  const { t, isRTL } = useTranslation()
  const router = useRouter()
  const { subjects } = useSubjectStore()
  const [subject, setSubject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const { chapters, fetchChapters, createChapter } = useChapters(subjectId)

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await subjectsApi.get(subjectId)
        setSubject(res.data)
      } catch {
        toast.error(t('errors.generic'))
        router.push('/subjects')
      } finally {
        setLoading(false)
      }
    }
    fetchSubject()
    fetchChapters()
  }, [subjectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!subject) return null

  const progressPercent = chapters.length
    ? chapters.reduce((a, c) => a + c.progress_percentage, 0) / chapters.length
    : 0

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-2 text-text-secondary transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{subject.icon || '📚'}</span>
              <h1 className="text-2xl font-bold text-text-primary">{subject.name}</h1>
            </div>
            {subject.exam_date && (
              <div className="flex items-center gap-1.5 text-sm text-warning mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(new Date(subject.exam_date), 'PPP')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:block">{t('common.edit')}</span>
          </button>
          <Link
            href={`/subjects/${subjectId}/exam-mode`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-sm transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:block">{t('subjects.partialExam')}</span>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">{t('subjects.progress')}</span>
          <span className="text-sm font-bold text-text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-surface-2 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: subject.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {chapters.length} {t('subjects.chapters')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <Upload className="w-4 h-4" />
          {t('chapters.uploadFile')}
        </button>
        <button
          onClick={async () => {
            const title = prompt(t('chapters.chapterTitlePlaceholder'))
            if (title) {
              await createChapter({ title, order_index: chapters.length })
              toast.success(t('common.success'))
            }
          }}
          className="flex items-center gap-2 bg-surface-2 hover:bg-surface text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('chapters.addManually')}
        </button>
      </div>

      {/* Chapters */}
      <ChapterList
        subjectId={subjectId}
        chapters={chapters}
        onRefresh={fetchChapters}
      />

      {/* Modals */}
      {showForm && (
        <SubjectForm
          subject={subject}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false)
            subjectsApi.get(subjectId).then((r) => setSubject(r.data))
          }}
        />
      )}
      {showUpload && (
        <FileUpload
          subjectId={subjectId}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); fetchChapters() }}
        />
      )}
    </div>
  )
}
