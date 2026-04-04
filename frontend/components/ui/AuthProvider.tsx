'use client'
// Auth is handled via JWT tokens stored in localStorage
// No server-side session provider needed

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
