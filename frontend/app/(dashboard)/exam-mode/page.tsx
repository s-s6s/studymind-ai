'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Loader2, ChevronRight, Brain } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubjects } from '@/hooks/useSubjects'
import { aiApi } from '@/lib/api'
import { toast } from 'sonner'

const EXAM_TYPES = ['midterm', 'final', 'quick']

export default function ExamModePage() {
  const { t, isRTL } = useTranslation()
  const { subjects, loading } = useSubjects()
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [examType, setExamType] = useState('midterm')
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)

  const subject = subjects.find((s) => s.id === selectedSubject)

  const toggleChapter = (id: string) => {
    const s = new Set(selectedChapters)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedChapters(s)
  }

  const selectAll = () => {
    if (!subject) return
    setSelectedChapters(new Set(subject.chapters?.map((c: any) => c.id) || []))
  }

  const handleGenerate = async () => {
    if (selectedChapters.size === 0) {
      toast.error(t('examMode.selectAtLeast'))
      return
    }
    setGenerating(true)
    try {
      await aiApi.partialExam({
        subject_id: selectedSubject,
        exam_type: examType,
        chapter_ids: Array.from(selectedChapters),
      })
      toast.success(t('common.success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.aiError'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Brain className="w-7 h-7 text-primary" />
          {t('examMode.title')}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">{t('examMode.generating')}</p>
      </motion.div>

      {/* Exam Type */}
      <section className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-text-primary mb-4">{t('examMode.selectType')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {EXAM_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setExamType(type)}
              className={`p-3 rounded-xl border text-center transition-all text-sm font-medium ${
                examType === type
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
              }`}
            >
              {type === 'midterm' ? '📋' : type === 'final' ? '🎓' : '⚡'} {t(`examMode.${type}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Subject selection */}
      <section className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-text-primary mb-4">{t('subjects.allSubjects')}</h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSubject(s.id === selectedSubject ? '' : s.id)
                  setSelectedChapters(new Set())
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedSubject === s.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="flex-1 font-medium text-text-primary text-sm">{s.name}</span>
                <span className="text-xs text-text-secondary">{s.chapter_count} chapters</span>
                <ChevronRight className={`w-4 h-4 text-text-secondary ${selectedSubject === s.id ? 'rotate-90' : ''} transition-transform`} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Chapters */}
      {subject && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">{t('examMode.selectChapters')}</h2>
            <button onClick={selectAll} className="text-xs text-primary hover:underline">
              {t('examMode.allSelected')}
            </button>
          </div>
          <div className="space-y-2">
            {subject.chapters?.map((ch: any) => (
              <button
                key={ch.id}
                onClick={() => toggleChapter(ch.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selectedChapters.has(ch.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedChapters.has(ch.id) ? 'bg-primary border-primary' : 'border-text-secondary'
                }`}>
                  {selectedChapters.has(ch.id) && <CheckSquare className="w-3 h-3 text-white" />}
                </div>
                <span className="flex-1 text-sm text-text-primary text-left">{ch.title}</span>
              </button>
            ))}
          </div>
          {selectedChapters.size > 0 && (
            <p className="text-xs text-primary mt-3">
              {t('examMode.chapterSelected', { count: selectedChapters.size })}
            </p>
          )}
        </motion.section>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!selectedSubject || selectedChapters.size === 0 || generating}
        className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all glow-primary"
      >
        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
        {generating ? t('examMode.generating') : t('examMode.generate')}
      </button>
    </div>
  )
}
