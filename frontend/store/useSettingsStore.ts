'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { settingsApi } from '@/lib/api'

interface SettingsState {
  language: string
  providers: any[]
  setLanguage: (lang: string) => void
  loadProviders: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ar',
      providers: [],
      setLanguage: (lang) => set({ language: lang }),
      loadProviders: async () => {
        try {
          const res = await settingsApi.getAiProviders()
          set({ providers: res.data })
        } catch {}
      },
    }),
    { name: 'settings-storage', partialize: (state) => ({ language: state.language }) }
  )
)
