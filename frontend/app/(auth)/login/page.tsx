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

export default function LoginPage() {
  const { t, dir, isRTL } = useTranslation()
  const router = useRouter()
  const { setUser } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
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
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 justify-center">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">StudyMind AI</span>
      </div>

      <h1 className="text-2xl font-bold text-text-primary text-center mb-1">
        {t('auth.loginTitle')}
      </h1>
      <p className="text-text-secondary text-center mb-6 text-sm">
        {t('auth.loginSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            {t('auth.email')}
          </label>
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
          <label className="block text-sm text-text-secondary mb-1.5">
            {t('auth.password')}
          </label>
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
              className={`absolute top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <Link href="#" className="text-sm text-primary hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-all flex items-center justify-center gap-2 glow-primary"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('auth.login')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          {t('auth.registerNow')}
        </Link>
      </div>
    </motion.div>
  )
}
