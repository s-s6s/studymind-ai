'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  language: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setAuthenticated: (value: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
