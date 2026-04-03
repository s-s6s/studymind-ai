'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, BookOpen, TrendingUp, Bell, Calendar, ChevronRight, Brain } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/useAuthStore'
import { useSubjects } from '@/hooks/useSubjects'
import { formatScore } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'

export default function DashboardPage() {
  const { t, isRTL } = useTranslation()
  const { user } = useAuthStore()
  const { subjects, loading, fetchSubjects } = useSubjects()

  useEffect(() => { fetchSubjects() }, [])

  const upcomingExams = subjects
    .filter((s) => s.exam_date && new Date(s.exam_date) > new Date())
    .sort((a, b) => new Date(a.exam_date!).getTime() - new Date(b.exam_date!).getTime())
    .slice(0, 3)

  const totalProgress = subjects.length
    ? subjects.reduce((acc, s) => acc + s.progress_percentage, 0) / subjects.length
    : 0

  const stats = [
    { label: t('dashboard.subjectsCount'), value: subjects.length, icon: BookOpen, color: 'text-primary' },
    { label: t('progress.totalChapters'), value: subjects.reduce((a, s) => a + s.chapter_count, 0), icon: Brain, color: 'text-accent' },
    { label: t('progress.overall'), value: `${Math.round(totalProgress)}%`, icon: TrendingUp, color: 'text-success' },
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">
          {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || '' })}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">{t('dashboard.quickStats')}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-warning" />
            {t('dashboard.upcomingExams')}
          </h2>
          <div className="space-y-3">
            {upcomingExams.map((subject) => {
              const daysLeft = differenceInDays(new Date(subject.exam_date!), new Date())
              return (
                <div key={subject.id}
                  className="glass rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    <div>
                      <p className="font-medium text-text-primary">{subject.name}</p>
                      <p className="text-xs text-text-secondary">
                        {format(new Date(subject.exam_date!), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    daysLeft === 0 ? 'bg-red-500/20 text-red-400' :
                    daysLeft <= 3 ? 'bg-warning/20 text-warning' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {daysLeft === 0 ? t('dashboard.examToday') : `${daysLeft} ${t('dashboard.daysUntilExam')}`}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Subjects */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text-primary">{t('dashboard.subjects')}</h2>
          <Link href="/subjects/new" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Plus className="w-4 h-4" />
            {t('dashboard.addSubject')}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">{t('dashboard.noSubjects')}</p>
            <Link href="/subjects"
              className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
              <Plus className="w-4 h-4" />
              {t('dashboard.addSubject')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.slice(0, 6).map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/subjects/${subject.id}`}>
                  <div className="glass rounded-2xl p-5 hover:shadow-glow transition-all hover:border-primary/40 group cursor-pointer"
                    style={{ borderLeft: `3px solid ${subject.color}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{subject.icon || '📚'}</span>
                      <ChevronRight className={`w-4 h-4 text-text-secondary group-hover:text-primary transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                    <h3 className="font-bold text-text-primary mb-1">{subject.name}</h3>
                    <p className="text-xs text-text-secondary mb-3">
                      {subject.chapter_count} {t('subjects.chapters')}
                    </p>
                    <div className="w-full bg-surface-2 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${subject.progress_percentage}%`, backgroundColor: subject.color }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {Math.round(subject.progress_percentage)}%
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
