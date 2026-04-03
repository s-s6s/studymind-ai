import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StudyMind AI — Transform Your Files Into Smart Study Material',
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
