'use client'
import { useState, useEffect, useCallback } from 'react'
import { subjectsApi } from '@/lib/api'
import { useSubjectStore } from '@/store/useSubjectStore'
import { toast } from 'sonner'

export function useSubjects() {
  const { subjects, setSubjects, addSubject, updateSubject, removeSubject, loading, setLoading } = useSubjectStore()

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await subjectsApi.getAll()
      setSubjects(res.data)
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }, [setSubjects, setLoading])

  const createSubject = async (data: any) => {
    try {
      const res = await subjectsApi.create(data)
      addSubject(res.data)
      return res.data
    } catch (error: any) {
      throw error
    }
  }

  const editSubject = async (id: string, data: any) => {
    try {
      const res = await subjectsApi.update(id, data)
      updateSubject(id, res.data)
      return res.data
    } catch (error: any) {
      throw error
    }
  }

  const deleteSubject = async (id: string) => {
    try {
      await subjectsApi.delete(id)
      removeSubject(id)
    } catch (error: any) {
      throw error
    }
  }

  return { subjects, loading, fetchSubjects, createSubject, editSubject, deleteSubject }
}
