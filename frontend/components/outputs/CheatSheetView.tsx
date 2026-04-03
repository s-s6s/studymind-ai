'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { Printer } from 'lucide-react'

interface CheatSheetData {
  title?: string
  key_terms: { term: string; definition: string }[]
  formulas: { name: string; formula: string; explanation?: string }[]
  comparisons: { aspect: string; a: string; b: string; a_label?: string; b_label?: string }[]
  must_remember: string[]
  common_mistakes: string[]
}

export default function CheatSheetView({ data }: { data: CheatSheetData }) {
  const { t, isRTL } = useTranslation()

  if (!data) return null

  const handlePrint = () => window.print()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        {data.title && (
          <h2 className="text-lg font-bold text-text-primary">{data.title}</h2>
        )}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <Printer className="w-4 h-4" />
          {t('outputs.printCheatSheet')}
        </button>
      </div>

      {/* Key Terms */}
      {data.key_terms?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
            {t('outputs.keyTerms')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.key_terms.map((item, i) => (
              <div key={i} className="bg-surface-2 rounded-xl p-3 border border-border">
                <p className="font-semibold text-text-primary text-sm">{item.term}</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formulas */}
      {data.formulas?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">
            {t('outputs.formulas')}
          </h3>
          <div className="space-y-2">
            {data.formulas.map((item, i) => (
              <div key={i} className="bg-surface-2 rounded-xl p-3 border border-border">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{item.name}</p>
                  <code className="text-accent bg-accent/10 px-2 py-0.5 rounded-lg text-sm font-mono whitespace-nowrap">
                    {item.formula}
                  </code>
                </div>
                {item.explanation && (
                  <p className="text-xs text-text-secondary mt-1">{item.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comparisons */}
      {data.comparisons?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-warning uppercase tracking-wider mb-3">
            {t('outputs.comparisons')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  <th className="p-2 text-text-secondary font-medium border border-border">Aspect</th>
                  <th className="p-2 text-primary font-medium border border-border">
                    {data.comparisons[0]?.a_label || 'A'}
                  </th>
                  <th className="p-2 text-accent font-medium border border-border">
                    {data.comparisons[0]?.b_label || 'B'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.comparisons.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-surface-2/50'}>
                    <td className="p-2 text-text-secondary border border-border">{item.aspect}</td>
                    <td className="p-2 text-text-primary border border-border">{item.a}</td>
                    <td className="p-2 text-text-primary border border-border">{item.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Must Remember */}
      {data.must_remember?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-success uppercase tracking-wider mb-3">
            {t('outputs.mustRemember')}
          </h3>
          <ul className="space-y-2">
            {data.must_remember.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-success mt-0.5">⭐</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Common Mistakes */}
      {data.common_mistakes?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">
            {t('outputs.commonMistakes')}
          </h3>
          <ul className="space-y-2">
            {data.common_mistakes.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-red-400 mt-0.5">⚠️</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
