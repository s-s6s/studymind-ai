'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, Check, RefreshCw, BookOpen } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { progressApi } from '@/lib/api'
import { toast } from 'sonner'

interface Flashcard {
  front: string
  back: string
  hint?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface FlashcardData {
  cards: Flashcard[]
  total: number
}

export default function FlashcardView({ data, chapterId }: { data: FlashcardData; chapterId: string }) {
  const { t, isRTL } = useTranslation()
  const [cards, setCards] = useState<Flashcard[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())
  const [review, setReview] = useState<Set<number>>(new Set())
  const [mode, setMode] = useState<'sequential' | 'random'>('sequential')
  const [filter, setFilter] = useState<'all' | 'known' | 'review'>('all')

  useEffect(() => {
    if (data?.cards) {
      setCards(data.cards)
      setCurrent(0)
      setFlipped(false)
    }
  }, [data])

  const filteredCards = filter === 'known'
    ? cards.filter((_, i) => known.has(i))
    : filter === 'review'
      ? cards.filter((_, i) => review.has(i))
      : cards

  const handleKnown = async () => {
    const newKnown = new Set(known)
    newKnown.add(current)
    const newReview = new Set(review)
    newReview.delete(current)
    setKnown(newKnown)
    setReview(newReview)
    try {
      await progressApi.updateFlashcard({ chapter_id: chapterId, card_index: current, status: 'known' })
    } catch {}
    nextCard()
  }

  const handleReview = async () => {
    const newReview = new Set(review)
    newReview.add(current)
    const newKnown = new Set(known)
    newKnown.delete(current)
    setKnown(newKnown)
    setReview(newReview)
    try {
      await progressApi.updateFlashcard({ chapter_id: chapterId, card_index: current, status: 'review' })
    } catch {}
    nextCard()
  }

  const nextCard = () => {
    setFlipped(false)
    if (mode === 'random') {
      setCurrent(Math.floor(Math.random() * filteredCards.length))
    } else {
      setCurrent((p) => (p + 1) % Math.max(filteredCards.length, 1))
    }
  }

  const prevCard = () => {
    setFlipped(false)
    setCurrent((p) => (p - 1 + filteredCards.length) % Math.max(filteredCards.length, 1))
  }

  if (!filteredCards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <BookOpen className="w-12 h-12 text-text-secondary" />
        <p className="text-text-secondary">{t('outputs.noContent')}</p>
      </div>
    )
  }

  const card = filteredCards[current]
  const difficultyColor = card.difficulty === 'easy'
    ? 'text-success' : card.difficulty === 'hard'
      ? 'text-red-400' : 'text-warning'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-3 text-text-secondary">
          <span className="text-success font-medium">{known.size} ✓</span>
          <span className="text-warning font-medium">{review.size} ↺</span>
          <span className="text-text-secondary">{cards.length - known.size - review.size} new</span>
        </div>
        <p className="text-text-secondary">
          {t('outputs.cardOf', { current: current + 1, total: filteredCards.length })}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'known', 'review'] as const).map((f) => (
          <button key={f}
            onClick={() => { setFilter(f); setCurrent(0); setFlipped(false) }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:text-text-primary'
            }`}
          >
            {t(`outputs.${f}Cards` as any) || f}
          </button>
        ))}
        <button
          onClick={() => { setMode(mode === 'sequential' ? 'random' : 'sequential') }}
          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            mode === 'random' ? 'bg-accent text-white' : 'bg-surface-2 text-text-secondary'
          }`}
        >
          <Shuffle className="w-3 h-3" />
          {t('outputs.random')}
        </button>
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? 'back' : 'front'}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center"
          >
            <span className={`text-xs font-medium uppercase mb-4 ${flipped ? 'text-primary' : 'text-text-secondary'}`}>
              {flipped ? t('outputs.flipCard') : 'Front'}
            </span>
            <p className="text-lg font-medium text-text-primary leading-relaxed">
              {flipped ? card.back : card.front}
            </p>
            {!flipped && card.hint && (
              <p className="text-xs text-text-secondary mt-3 italic">💡 {card.hint}</p>
            )}
            {card.difficulty && (
              <span className={`text-xs mt-3 ${difficultyColor}`}>
                {card.difficulty}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-text-secondary">
          <RotateCcw className="w-3 h-3" />
          {t('outputs.flipCard')}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevCard}
          className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors text-text-secondary">
          <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleReview}
            className="flex items-center gap-1.5 px-4 py-2 bg-warning/20 text-warning rounded-xl text-sm font-medium hover:bg-warning/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('outputs.review')}
          </button>
          <button
            onClick={handleKnown}
            className="flex items-center gap-1.5 px-4 py-2 bg-success/20 text-success rounded-xl text-sm font-medium hover:bg-success/30 transition-colors"
          >
            <Check className="w-4 h-4" />
            {t('outputs.known')}
          </button>
        </div>

        <button onClick={nextCard}
          className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors text-text-secondary">
          <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface-2 rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / filteredCards.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
