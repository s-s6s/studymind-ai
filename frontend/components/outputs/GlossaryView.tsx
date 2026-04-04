'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface GlossaryTerm {
  term: string
  definition: string
  example?: string
  category?: string
}

interface GlossaryData {
  terms: GlossaryTerm[]
  total: number
}

export default function GlossaryView({ data }: { data: GlossaryData }) {
  const { t, isRTL } = useTranslation()
  const [search, setSearch] = useState('')

  if (!data?.terms?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-text-secondary">{t('outputs.noTerms')}</p>
      </div>
    )
  }

  const filtered = data.terms.filter(
    (term) =>
      term.term.toLowerCase().includes(search.toLowerCase()) ||
      term.definition.toLowerCase().includes(search.toLowerCase())
  )

  // Group by first letter
  const grouped: Record<string, GlossaryTerm[]> = {}
  filtered.forEach((term) => {
    const key = term.term.charAt(0).toUpperCase()
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(term)
  })

  const sortedKeys = Object.keys(grouped).sort()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('outputs.searchTerms')}
          className={`w-full bg-surface-2 border border-border rounded-xl py-2.5 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors text-sm ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
        />
      </div>

      {/* Stats */}
      <p className="text-xs text-text-secondary">{filtered.length} {t('outputs.keyTerms')}</p>

      {/* Terms grouped by letter */}
      {sortedKeys.length === 0 ? (
        <p className="text-text-secondary text-center py-8">{t('outputs.noTerms')}</p>
      ) : (
        <div className="space-y-6">
          {sortedKeys.map((letter) => (
            <div key={letter}>
              <div className="sticky top-0 bg-surface-1 z-10 py-1">
                <span className="text-sm font-bold text-primary">{letter}</span>
                <div className="h-px bg-border mt-1" />
              </div>
              <div className="space-y-2 mt-2">
                {grouped[letter].map((term, i) => (
                  <div key={i} className="group p-3 rounded-xl hover:bg-surface-2 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary text-sm">{term.term}</h4>
                        <p className="text-text-secondary text-sm mt-0.5 leading-relaxed">{term.definition}</p>
                        {term.example && (
                          <p className="text-xs text-text-secondary/70 mt-1 italic">
                            e.g., {term.example}
                          </p>
                        )}
                      </div>
                      {term.category && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-lg flex-shrink-0">
                          {term.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
