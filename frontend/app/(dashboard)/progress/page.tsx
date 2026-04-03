'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Brain, Zap, Clock, Trophy, BookOpen } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubjects } from '@/hooks/useSubjects'
import { useProgress } from '@/hooks/useProgress'
import { format } from 'date-fns'

export default function ProgressPage() {
  const { t, isRTL } = useTranslation()
  const { subjects } = useSubjects()
  const { progress, history, loading, fetchProgress, fetchHistory } = useProgress()

  useEffect(() => {
    fetchProgress()
    fetchHistory()
  }, [])

  const overallProgress = subjects.length
    ? subjects.reduce((acc, s) => acc + s.progress_percentage, 0) / subjects.length
    : 0

  const stats = [
    {
      label: t('progress.overall'),
      value: `${Math.round(overallProgress)}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: t('progress.totalSubjects'),
      value: subjects.length,
      icon: BookOpen,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: t('progress.totalChapters'),
      value: subjects.reduce((a, s) => a + s.chapter_count, 0),
      icon: Brain,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: t('progress.avgScore'),
      value: progress?.avg_score ? `${Math.round(progress.avg_score)}%` : '—',
      icon: Trophy,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-primary" />
          {t('progress.title')}
        </h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Subjects Progress */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="font-bold text-text-primary mb-4">{t('progress.subjectProgress')}</h2>
        <div className="space-y-4">
          {subjects.length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-4">{t('progress.noHistory')}</p>
          ) : (
            subjects.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-text-primary font-medium">{s.name}</span>
                  </div>
                  <span className="text-text-secondary">{Math.round(s.progress_percentage)}%</span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.progress_percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
                <p className="text-xs text-text-secondary">{s.chapter_count} chapters</p>
              </div>
            ))
          )}
        </div>
      </motion.section>

      {/* Exam History */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="font-bold text-text-primary mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-secondary" />
          {t('progress.examHistory')}
        </h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history?.length === 0 ? (
          <p className="text-text-secondary text-sm text-center py-4">{t('progress.noHistory')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary border-b border-border">
                  <th className="pb-2 font-medium text-left">{t('progress.date')}</th>
                  <th className="pb-2 font-medium text-left">{t('progress.subject')}</th>
                  <th className="pb-2 font-medium text-left">{t('progress.type')}</th>
                  <th className="pb-2 font-medium text-right">{t('progress.scoreLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history?.map((item: any, i: number) => (
                  <tr key={i} className="py-2">
                    <td className="py-2.5 text-text-secondary">
                      {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-2.5 text-text-primary font-medium">
                      {item.subject_name || '—'}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-lg">
                        {item.exam_type || 'MCQ'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`font-bold ${
                        item.score >= 80 ? 'text-success' :
                        item.score >= 60 ? 'text-warning' :
                        'text-red-400'
                      }`}>{item.score}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </div>
  )
}
