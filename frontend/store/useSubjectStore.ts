'use client'
import { create } from 'zustand'

interface Subject {
  id: string
  name: string
  color: string
  icon?: string
  exam_date?: string
  reminder_enabled: boolean
  chapter_count: number
  progress_percentage: number
  created_at: string
  updated_at: string
  chapters?: any[]
}

interface SubjectState {
  subjects: Subject[]
  loading: boolean
  setSubjects: (subjects: Subject[]) => void
  addSubject: (subject: Subject) => void
  updateSubject: (id: string, data: Partial<Subject>) => void
  removeSubject: (id: string) => void
  setLoading: (value: boolean) => void
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  loading: false,
  setSubjects: (subjects) => set({ subjects }),
  addSubject: (subject) =>
    set((state) => ({ subjects: [subject, ...state.subjects] })),
  updateSubject: (id, data) =>
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),
  removeSubject: (id) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
    })),
  setLoading: (value) => set({ loading: value }),
}))
