'use client'
import { useCallback } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'
import ar from '@/i18n/ar.json'
import en from '@/i18n/en.json'

type Translations = typeof ar

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) || path
}

export function useTranslation() {
  const { language, setLanguage } = useSettingsStore()
  const translations: Translations = language === 'ar' ? ar : (en as any)

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = getNestedValue(translations, key)
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          text = text.replace(`{${param}}`, String(value))
        })
      }
      return text
    },
    [translations]
  )

  const isRTL = language === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'

  return { t, language, isRTL, dir, setLanguage: (lang: 'ar' | 'en') => setLanguage(lang) }
}
