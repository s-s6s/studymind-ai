'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { progressApi } from '@/lib/api'

interface MCQOption {
  label: string
  text: string
}

interface MCQuestion {
  question: string
  options: MCQOption[]
  correct_answer: string
  explanation: string
  difficulty?: string
}

interface MCQData {
  questions: MCQuestion[]
  total: number
}

export default function MCQView({ data, chapterId, subjectId }: {
  data: MCQData
  chapterId: string
  subjectId: string
}) {
  const { t, isRTL } = useTranslation()
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)

  const questions = data?.questions || []

  const reset = () => {
    setStarted(false)
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setResults([])
    setFinished(false)
  }

  const handleAnswer = (label: string) => {
    if (answered) return
    setSelected(label)
    setAnswered(true)
    const isCorrect = label === questions[current].correct_answer
    if (isCorrect) setScore((s) => s + 1)
    setResults((r) => [...r, isCorrect])
  }

  const handleNext = async () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
      setSaving(true)
      try {
        await progressApi.saveExamResult({
          subject_id: subjectId,
          chapter_id: chapterId,
          score: Math.round(((score + (selected === questions[current].correct_answer ? 1 : 0)) / questions.length) * 100),
          total_questions: questions.length,
          correct_answers: score + (selected === questions[current].correct_answer ? 1 : 0),
        })
      } catch {}
      setSaving(false)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">{t('outputs.startQuiz')}</h3>
        <p className="text-text-secondary text-sm">{questions.length} {t('outputs.questionOf', { current: 1, total: questions.length }).split(' ')[1]}</p>
        <button
          onClick={() => setStarted(true)}
          className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          {t('outputs.startQuiz')}
        </button>
      </div>
    )
  }

  if (finished) {
    const finalScore = Math.round((score / questions.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex flex-col items-center justify-center py-10 gap-5"
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
          finalScore >= 80 ? 'bg-success/20 text-success' :
          finalScore >= 60 ? 'bg-warning/20 text-warning' :
          'bg-red-500/20 text-red-400'
        }`}>
          {finalScore}%
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-text-primary mb-1">{t('outputs.quizResult')}</h3>
          <p className="text-text-secondary">
            {score}/{questions.length} {t('outputs.correct')}
          </p>
        </div>

        {/* Per-question summary */}
        <div className="w-full max-w-md grid grid-cols-5 gap-2">
          {results.map((r, i) => (
            <div key={i}
              className={`h-2 rounded-full ${r ? 'bg-success' : 'bg-red-500'}`}
            />
          ))}
        </div>

        {saving && (
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}

        <button onClick={reset}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          <RotateCcw className="w-4 h-4" />
          {t('outputs.retakeQuiz')}
        </button>
      </motion.div>
    )
  }

  const q = questions[current]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>{t('outputs.questionOf', { current: current + 1, total: questions.length })}</span>
        <span className="text-success font-medium">{score} ✓</span>
      </div>
      <div className="w-full bg-surface-2 rounded-full h-1.5">
        <div className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          className="space-y-4"
        >
          <p className="text-text-primary font-medium text-base leading-relaxed">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((opt) => {
              const isSelected = selected === opt.label
              const isCorrect = opt.label === q.correct_answer
              let className = 'w-full text-left p-4 rounded-xl border transition-all text-sm '
              if (!answered) {
                className += 'border-border hover:border-primary/50 hover:bg-surface-2 cursor-pointer text-text-primary'
              } else if (isCorrect) {
                className += 'border-success bg-success/10 text-success cursor-default'
              } else if (isSelected && !isCorrect) {
                className += 'border-red-500 bg-red-500/10 text-red-400 cursor-default'
              } else {
                className += 'border-border text-text-secondary cursor-default opacity-60'
              }

              return (
                <button
                  key={opt.label}
                  onClick={() => handleAnswer(opt.label)}
                  className={className}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      !answered ? 'bg-surface-2 text-text-secondary' :
                      isCorrect ? 'bg-success text-white' :
                      isSelected ? 'bg-red-500 text-white' :
                      'bg-surface-2 text-text-secondary'
                    }`}>{opt.label}</span>
                    {opt.text}
                    {answered && isCorrect && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                    {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {answered && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4"
            >
              <p className="text-sm text-text-secondary">
                <span className="text-primary font-medium">{t('outputs.explanation')}: </span>
                {q.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {answered && (
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            {current + 1 >= questions.length ? t('outputs.quizResult') : t('outputs.nextQuestion')}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}
