'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/useTranslation'
import { authApi } from '@/lib/api'
import { setTokens } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

export default function RegisterPage() {
  const { t, dir, isRTL } = useTranslation()
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error(t('errors.passwordMismatch'))
      return
    }
    if (form.password.length < 8) {
      toast.error(t('errors.minLength', { min: 8 }))
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password })
      const { access_token, refresh_token } = res.data
      setTokens(access_token, refresh_token)
      const meRes = await authApi.me()
      setUser(meRes.data)
      router.push('/dashboard')
      toast.success(t('common.success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      dir={dir}
      className="glass rounded-2xl p-8 shadow-glow"
    >
      <div className="flex items-center gap-3 mb-8 justify-center">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">StudyMind AI</span>
      </div>

      <h1 className="text-2xl font-bold text-text-primary text-center mb-1">
        {t('auth.registerTitle')}
      </h1>
      <p className="text-text-secondary text-center mb-6 text-sm">
        {t('auth.registerSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">{t('auth.name')}</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t('auth.namePlaceholder')}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">{t('auth.email')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t('auth.emailPlaceholder')}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">{t('auth.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t('auth.passwordPlaceholder')}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary ${isRTL ? 'left-3' : 'right-3'}`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder={t('auth.passwordPlaceholder')}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('auth.register')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.haveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('auth.loginNow')}
        </Link>
      </div>
    </motion.div>
  )
}
