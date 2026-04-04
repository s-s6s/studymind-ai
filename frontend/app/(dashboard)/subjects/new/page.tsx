'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import SubjectForm from '@/components/subjects/SubjectForm'

export default function NewSubjectPage() {
  const { t, isRTL } = useTranslation()
  const router = useRouter()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-2 text-text-secondary transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">{t('subjects.newSubject')}</h1>
      </motion.div>

      <SubjectForm
        onSuccess={() => router.push('/subjects')}
        onCancel={() => router.back()}
      />
    </div>
  )
}
