'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, BookOpen, Trash2, Pencil, ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubjects } from '@/hooks/useSubjects'
import SubjectForm from '@/components/subjects/SubjectForm'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function SubjectsPage() {
  const { t, isRTL } = useTranslation()
  const { subjects, loading, fetchSubjects, deleteSubject } = useSubjects()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editSubject, setEditSubject] = useState<any>(null)

  useEffect(() => { fetchSubjects() }, [])

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('subjects.deleteConfirm'))) return
    try {
      await deleteSubject(id)
      toast.success(t('subjects.deleted'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('subjects.allSubjects')}</h1>
          <p className="text-text-secondary text-sm mt-1">{subjects.length} {t('nav.subjects')}</p>
        </div>
        <button
          onClick={() => { setEditSubject(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('subjects.newSubject')}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className={`w-full bg-surface border border-border rounded-xl py-2.5 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary text-lg">{t('dashboard.noSubjects')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl overflow-hidden hover:shadow-glow transition-all group"
                style={{ borderTop: `3px solid ${subject.color}` }}
              >
                <Link href={`/subjects/${subject.id}`} className="block p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl">{subject.icon || '📚'}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.preventDefault(); setEditSubject(subject); setShowForm(true) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleDelete(subject.id, subject.name) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-text-primary mb-1 truncate">{subject.name}</h3>
                  <p className="text-xs text-text-secondary mb-3">
                    {subject.chapter_count} {t('subjects.chapters')}
                  </p>
                  {subject.exam_date && (
                    <div className="flex items-center gap-1.5 text-xs text-warning mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(subject.exam_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  <div className="w-full bg-surface-2 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${subject.progress_percentage}%`, backgroundColor: subject.color }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1.5">
                    {Math.round(subject.progress_percentage)}% {t('subjects.progress')}
                  </p>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Subject Form Modal */}
      <AnimatePresence>
        {showForm && (
          <SubjectForm
            subject={editSubject}
            onClose={() => setShowForm(false)}
            onSave={() => { setShowForm(false); fetchSubjects() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
