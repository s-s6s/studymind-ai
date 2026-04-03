'use client'
import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FileText, Layers, BookOpen, Zap,
  GitBranch, List, MessageSquare, Loader2, RefreshCw
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { chaptersApi, aiApi } from '@/lib/api'
import { toast } from 'sonner'
import SummaryView from '@/components/outputs/SummaryView'
import FlashcardView from '@/components/outputs/FlashcardView'
import MCQView from '@/components/outputs/MCQView'
import CheatSheetView from '@/components/outputs/CheatSheetView'
import GlossaryView from '@/components/outputs/GlossaryView'

const MindMapView = lazy(() => import('@/components/mindmap/MindMapView'))
const ChatInterface = lazy(() => import('@/components/chat/ChatInterface'))

export default function ChapterDetailPage() {
  const { subjectId, chapterId } = useParams() as { subjectId: string; chapterId: string }
  const { t, isRTL, language } = useTranslation()
  const router = useRouter()

  const [chapter, setChapter] = useState<any>(null)
  const [contents, setContents] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState('summary')
  const [detailLevel, setDetailLevel] = useState('medium')

  const tabs = [
    { id: 'summary', label: t('outputs.summary'), icon: FileText },
    { id: 'flashcards', label: t('outputs.flashcards'), icon: Layers },
    { id: 'quiz', label: t('outputs.quiz'), icon: Zap },
    { id: 'cheatsheet', label: t('outputs.cheatSheet'), icon: BookOpen },
    { id: 'mindmap', label: t('outputs.mindMap'), icon: GitBranch },
    { id: 'glossary', label: t('outputs.glossary'), icon: List },
    { id: 'chat', label: t('outputs.aiAssistant'), icon: MessageSquare },
  ]

  const contentTypeMap: Record<string, string> = {
    quiz: 'mcq',
    cheatsheet: 'cheatsheet',
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await chaptersApi.getAll(subjectId)
        const ch = res.data.find((c: any) => c.id === chapterId)
        if (ch) setChapter(ch)
      } catch {}
      setLoading(false)
    }
    load()
  }, [chapterId, subjectId])

  const generateContent = async (tab: string) => {
    const contentType = contentTypeMap[tab] || tab
    setGenerating((p) => ({ ...p, [tab]: true }))
    try {
      const apiMap: Record<string, Function> = {
        summary: aiApi.generateSummary,
        flashcards: aiApi.generateFlashcards,
        mcq: aiApi.generateMcq,
        cheatsheet: aiApi.generateCheatsheet,
        mindmap: aiApi.generateMindmap,
        glossary: aiApi.generateGlossary,
      }
      const fn = apiMap[contentType]
      if (!fn) return
      const res = await fn({ chapter_id: chapterId, detail_level: detailLevel, language })
      setContents((p) => ({ ...p, [tab]: res.data }))
      toast.success(t('common.success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.aiError'))
    } finally {
      setGenerating((p) => ({ ...p, [tab]: false }))
    }
  }

  const generateAll = async () => {
    setGenerating({ summary: true, flashcards: true, quiz: true, cheatsheet: true, mindmap: true, glossary: true })
    try {
      await aiApi.generateAll({ chapter_id: chapterId, detail_level: detailLevel, language })
      // Reload page to show content
      window.location.reload()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.aiError'))
    } finally {
      setGenerating({})
    }
  }

  const currentContent = contents[activeTab]
  const isGenerating = generating[activeTab]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-2 text-text-secondary transition-colors">
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">{chapter?.title}</h1>
          <p className="text-sm text-text-secondary">{Math.round(chapter?.progress_percentage || 0)}% {t('subjects.progress')}</p>
        </div>
        <button
          onClick={generateAll}
          disabled={Object.values(generating).some(Boolean)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all"
        >
          {Object.values(generating).some(Boolean) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="hidden sm:block">{t('outputs.generateAll')}</span>
        </button>
      </div>

      {/* Detail Level */}
      {activeTab !== 'chat' && activeTab !== 'mindmap' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-secondary">{t('outputs.detailLevel')}:</span>
          {['concise', 'medium', 'detailed'].map((level) => (
            <button
              key={level}
              onClick={() => setDetailLevel(level)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                detailLevel === level
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 text-text-secondary hover:text-text-primary'
              }`}
            >
              {t(`outputs.${level}` as any)}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'chat' ? (
          <Suspense fallback={<div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
            <ChatInterface subjectId={subjectId} chapterId={chapterId} />
          </Suspense>
        ) : activeTab === 'mindmap' ? (
          <div className="glass rounded-2xl overflow-hidden" style={{ height: '500px' }}>
            {currentContent ? (
              <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
                <MindMapView data={currentContent.content_data} />
              </Suspense>
            ) : (
              <NoContentPlaceholder
                isGenerating={isGenerating}
                onGenerate={() => generateContent('mindmap')}
                t={t}
              />
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-5">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-text-secondary">{t('outputs.generating')}</p>
              </div>
            ) : !currentContent ? (
              <NoContentPlaceholder
                isGenerating={false}
                onGenerate={() => generateContent(activeTab)}
                t={t}
              />
            ) : (
              <>
                {activeTab === 'summary' && <SummaryView data={currentContent.content_data} />}
                {activeTab === 'flashcards' && (
                  <FlashcardView
                    data={currentContent.content_data}
                    chapterId={chapterId}
                  />
                )}
                {activeTab === 'quiz' && (
                  <MCQView
                    data={currentContent.content_data}
                    chapterId={chapterId}
                    subjectId={subjectId}
                  />
                )}
                {activeTab === 'cheatsheet' && <CheatSheetView data={currentContent.content_data} />}
                {activeTab === 'glossary' && <GlossaryView data={currentContent.content_data} />}
              </>
            )}
            {currentContent && activeTab !== 'chat' && (
              <div className={`mt-4 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <button
                  onClick={() => generateContent(activeTab)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('outputs.regenerate')}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function NoContentPlaceholder({ isGenerating, onGenerate, t }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <p className="text-text-secondary text-center">{t('outputs.noContent')}</p>
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {t('outputs.regenerate')}
      </button>
    </div>
  )
}
