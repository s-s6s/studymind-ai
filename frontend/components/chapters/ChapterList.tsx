'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Trash2, ChevronRight, GripVertical } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { chaptersApi } from '@/lib/api'
import { toast } from 'sonner'

interface Props {
  subjectId: string
  chapters: any[]
  onRefresh: () => void
}

export default function ChapterList({ subjectId, chapters, onRefresh }: Props) {
  const { t, isRTL } = useTranslation()

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm'))) return
    try {
      await chaptersApi.delete(id)
      toast.success(t('common.success'))
      onRefresh()
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  if (chapters.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
        <p className="text-text-secondary">{t('subjects.noChapters')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-text-primary">{t('subjects.chapters')}</h2>
      {chapters.map((chapter, i) => (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl overflow-hidden group hover:shadow-glow transition-all"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="text-text-secondary cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/subjects/${subjectId}/chapters/${chapter.id}`} className="block">
                <h3 className="font-medium text-text-primary hover:text-primary transition-colors truncate">
                  {chapter.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-surface-2 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-primary"
                      style={{ width: `${chapter.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {Math.round(chapter.progress_percentage)}%
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDelete(chapter.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Link href={`/subjects/${subjectId}/chapters/${chapter.id}`}
              className="text-text-secondary hover:text-primary transition-colors">
              <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
