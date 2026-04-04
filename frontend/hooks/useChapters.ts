'use client'
import { useState, useCallback } from 'react'
import { chaptersApi } from '@/lib/api'
import { toast } from 'sonner'

export function useChapters(subjectId: string) {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchChapters = useCallback(async () => {
    if (!subjectId) return
    setLoading(true)
    try {
      const res = await chaptersApi.getAll(subjectId)
      setChapters(res.data)
    } catch (error: any) {
      toast.error('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  const createChapter = async (data: any) => {
    const res = await chaptersApi.create(subjectId, data)
    setChapters((prev) => [...prev, res.data])
    return res.data
  }

  const deleteChapter = async (id: string) => {
    await chaptersApi.delete(id)
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }

  const reorderChapters = async (newOrder: any[]) => {
    setChapters(newOrder)
    await chaptersApi.reorder(newOrder.map((c, i) => ({ id: c.id, order_index: i })))
  }

  return { chapters, loading, fetchChapters, createChapter, deleteChapter, reorderChapters, setChapters }
}
