'use client'
import { useState, useCallback } from 'react'
import { progressApi } from '@/lib/api'

export function useProgress() {
  const [progress, setProgress] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProgress = useCallback(async () => {
    setLoading(true)
    try {
      const res = await progressApi.get()
      setProgress(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    const res = await progressApi.getHistory()
    setHistory(res.data)
  }, [])

  const updateFlashcard = async (data: any) => {
    await progressApi.updateFlashcard(data)
  }

  const saveExamResult = async (data: any) => {
    await progressApi.saveExamResult(data)
  }

  return { progress, history, loading, fetchProgress, fetchHistory, updateFlashcard, saveExamResult }
}
