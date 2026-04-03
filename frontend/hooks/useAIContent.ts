'use client'
import { useState, useCallback } from 'react'
import { aiApi } from '@/lib/api'
import { toast } from 'sonner'

export function useAIContent(chapterId: string, language: string = 'ar') {
  const [contents, setContents] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const generate = useCallback(
    async (contentType: string, detailLevel: string = 'medium') => {
      setLoading((prev) => ({ ...prev, [contentType]: true }))
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
        setContents((prev) => ({ ...prev, [contentType]: res.data }))
        return res.data
      } catch (error: any) {
        const msg = error?.response?.data?.detail || 'Failed to generate content'
        toast.error(msg)
        throw error
      } finally {
        setLoading((prev) => ({ ...prev, [contentType]: false }))
      }
    },
    [chapterId, language]
  )

  const generateAll = useCallback(
    async (detailLevel: string = 'medium') => {
      setLoading({ summary: true, flashcards: true, mcq: true, cheatsheet: true, mindmap: true, glossary: true })
      try {
        await aiApi.generateAll({ chapter_id: chapterId, detail_level: detailLevel, language })
        toast.success('All content generated!')
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || 'Failed to generate content')
      } finally {
        setLoading({})
      }
    },
    [chapterId, language]
  )

  return { contents, loading, generate, generateAll, setContents }
}
