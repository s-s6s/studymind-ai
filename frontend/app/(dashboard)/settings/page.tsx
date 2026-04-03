'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Brain, Globe, Plus, Trash2,
  Eye, EyeOff, Check, X, Loader2, Key
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/useAuthStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { settingsApi } from '@/lib/api'
import { toast } from 'sonner'

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  { id: 'google', name: 'Google AI', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'] },
  { id: 'groq', name: 'Groq', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'] },
  { id: 'openrouter', name: 'OpenRouter', models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet'] },
]

export default function SettingsPage() {
  const { t, isRTL, language, setLanguage } = useTranslation()
  const { user } = useAuthStore()
  const { providers, loadProviders } = useSettingsStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'language'>('profile')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // AI provider form
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [providerForm, setProviderForm] = useState({ provider: '', model: '', api_key: '' })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingKey, setTestingKey] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [addingProvider, setAddingProvider] = useState(false)

  useEffect(() => {
    loadProviders()
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await settingsApi.updateProfile(profileForm)
      toast.success(t('settings.profileUpdated'))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.generic'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm) {
      toast.error(t('errors.passwordMismatch'))
      return
    }
    setSavingPassword(true)
    try {
      await settingsApi.updateProfile({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      toast.success(t('common.success'))
      setPasswordForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.generic'))
    } finally {
      setSavingPassword(false)
    }
  }

  const handleTestKey = async () => {
    setTestingKey(true)
    setTestResult(null)
    try {
      await settingsApi.testApiKey(providerForm)
      setTestResult('success')
    } catch {
      setTestResult('error')
    } finally {
      setTestingKey(false)
    }
  }

  const handleAddProvider = async () => {
    if (!providerForm.provider || !providerForm.model || !providerForm.api_key) {
      toast.error(t('errors.required'))
      return
    }
    setAddingProvider(true)
    try {
      await settingsApi.addAiProvider(providerForm)
      await loadProviders()
      setShowAddProvider(false)
      setProviderForm({ provider: '', model: '', api_key: '' })
      toast.success(t('settings.providerAdded'))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.generic'))
    } finally {
      setAddingProvider(false)
    }
  }

  const handleDeleteProvider = async (id: string) => {
    try {
      await settingsApi.deleteAiProvider(id)
      await loadProviders()
      toast.success(t('settings.providerDeleted'))
    } catch {}
  }

  const handleSetActive = async (id: string) => {
    try {
      await settingsApi.updateAiProvider(id, { is_active: true })
      await loadProviders()
    } catch {}
  }

  const selectedProvider = AI_PROVIDERS.find((p) => p.id === providerForm.provider)

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'ai', label: t('settings.aiSettings'), icon: Brain },
    { id: 'language', label: t('settings.language'), icon: Globe },
  ] as const

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" />
          {t('settings.title')}
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">{t('settings.updateProfile')}</h2>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">{t('auth.name')}</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">{t('auth.email')}</label>
              <input
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                type="email"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                dir="ltr"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('common.save')}
            </button>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-text-primary">{t('settings.changePassword')}</h2>
            {(['current_password', 'new_password', 'confirm'] as const).map((field) => (
              <div key={field}>
                <label className="text-sm text-text-secondary mb-1.5 block">
                  {field === 'current_password' ? t('settings.currentPassword') :
                   field === 'new_password' ? t('settings.newPassword') :
                   t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm[field]}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                    dir="ltr"
                  />
                  {field === 'current_password' && (
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 text-text-secondary"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="flex items-center gap-2 bg-surface-2 hover:bg-surface-3 text-text-primary px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border border-border"
            >
              {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('settings.changePassword')}
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Settings Tab */}
      {activeTab === 'ai' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Existing providers */}
          {providers.length === 0 && !showAddProvider ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Key className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary text-sm">{t('settings.noProviders')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {providers.map((p: any) => (
                <div key={p.id}
                  className={`glass rounded-xl p-4 flex items-center gap-3 ${p.is_active ? 'border-primary/50' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary text-sm">{p.provider}</span>
                      {p.is_active && (
                        <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                          {t('settings.active')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{p.model}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!p.is_active && (
                      <button
                        onClick={() => handleSetActive(p.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        {t('settings.setActive')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProvider(p.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add provider form */}
          {showAddProvider ? (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-text-primary">{t('settings.addProvider')}</h3>

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">{t('settings.provider')}</label>
                <select
                  value={providerForm.provider}
                  onChange={(e) => setProviderForm((p) => ({ ...p, provider: e.target.value, model: '' }))}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  <option value="">{t('settings.selectProvider')}</option>
                  {AI_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProvider && (
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">{t('settings.model')}</label>
                  <select
                    value={providerForm.model}
                    onChange={(e) => setProviderForm((p) => ({ ...p, model: e.target.value }))}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                  >
                    <option value="">{t('settings.selectModel')}</option>
                    {selectedProvider.models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">{t('settings.apiKey')}</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={providerForm.api_key}
                    onChange={(e) => setProviderForm((p) => ({ ...p, api_key: e.target.value }))}
                    placeholder={t('settings.apiKeyPlaceholder')}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm pr-10"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-text-secondary"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Test result */}
              {testResult && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  testResult === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {testResult === 'success'
                    ? <><Check className="w-4 h-4" /> {t('settings.connectionSuccess')}</>
                    : <><X className="w-4 h-4" /> {t('settings.connectionFailed')}</>
                  }
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTestKey}
                  disabled={testingKey || !providerForm.api_key}
                  className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-primary/50 transition-colors disabled:opacity-50"
                >
                  {testingKey && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('settings.testConnection')}
                </button>
                <button
                  onClick={handleAddProvider}
                  disabled={addingProvider}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {addingProvider && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('common.save')}
                </button>
                <button
                  onClick={() => { setShowAddProvider(false); setTestResult(null) }}
                  className="px-4 py-2 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddProvider(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-5 text-text-secondary hover:text-primary transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('settings.addProvider')}
            </button>
          )}
        </motion.div>
      )}

      {/* Language Tab */}
      {activeTab === 'language' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-text-primary">{t('settings.language')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'ar', label: t('settings.arabic'), emoji: '🇸🇦' },
                { code: 'en', label: t('settings.english'), emoji: '🇺🇸' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={async () => {
                    setLanguage(lang.code as 'ar' | 'en')
                    try {
                      await settingsApi.updateLanguage(lang.code)
                    } catch {}
                  }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    language === lang.code
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{lang.emoji}</div>
                  <p className="font-medium text-text-primary text-sm">{lang.label}</p>
                  {language === lang.code && (
                    <span className="text-xs text-primary">✓ Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
