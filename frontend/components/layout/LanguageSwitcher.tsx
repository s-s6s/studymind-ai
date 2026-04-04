'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { useSettingsStore } from '@/store/useSettingsStore'
import { settingsApi } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useSettingsStore()
  const { t } = useTranslation()
  const { user, setUser } = useAuthStore()

  const toggle = async () => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
    if (user) {
      try {
        await settingsApi.updateLanguage(newLang)
        setUser({ ...user, language: newLang })
      } catch {}
    }
    // Reload page to apply language
    window.location.reload()
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-primary/20 text-text-secondary hover:text-primary transition-all text-sm font-medium border border-border"
    >
      <span>{language === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  )
}
