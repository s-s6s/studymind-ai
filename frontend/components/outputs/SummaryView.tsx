'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Lightbulb, Target, List } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface SummaryData {
  title?: string
  main_points: string[]
  key_ideas: string[]
  detailed_summary: string
  conclusion?: string
}

export default function SummaryView({ data }: { data: SummaryData }) {
  const { t, isRTL } = useTranslation()
  const [expandedSection, setExpandedSection] = useState<string | null>('main')

  if (!data) return null

  const toggle = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section)

  const Section = ({
    id, icon: Icon, title, color, children
  }: { id: string; icon: any; title: string; color: string; children: React.ReactNode }) => (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-text-primary">{title}</span>
        </div>
        {expandedSection === id
          ? <ChevronUp className="w-4 h-4 text-text-secondary" />
          : <ChevronDown className="w-4 h-4 text-text-secondary" />
        }
      </button>
      {expandedSection === id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  )

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-3">
      {data.title && (
        <h2 className="text-xl font-bold text-text-primary mb-4">{data.title}</h2>
      )}

      {/* Detailed summary */}
      <Section id="main" icon={List} title={t('outputs.mainPoints')} color="bg-primary">
        <p className="text-text-secondary leading-relaxed text-sm whitespace-pre-line">
          {data.detailed_summary}
        </p>
      </Section>

      {/* Main points */}
      {data.main_points?.length > 0 && (
        <Section id="points" icon={Target} title={t('outputs.keyIdeas')} color="bg-accent">
          <ul className="space-y-2 mt-1">
            {data.main_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Key ideas */}
      {data.key_ideas?.length > 0 && (
        <Section id="ideas" icon={Lightbulb} title={t('outputs.keyIdeas')} color="bg-warning">
          <div className="flex flex-wrap gap-2 mt-1">
            {data.key_ideas.map((idea, i) => (
              <span key={i}
                className="px-3 py-1.5 bg-warning/10 text-warning text-sm rounded-lg border border-warning/20">
                {idea}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Conclusion */}
      {data.conclusion && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-text-secondary italic">{data.conclusion}</p>
        </div>
      )}
    </div>
  )
}
