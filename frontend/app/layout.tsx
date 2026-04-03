import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'StudyMind AI — منصة المراجعة الذكية',
  description: 'حوّل ملفاتك الدراسية إلى ملخصات، بطاقات مراجعة، اختبارات، وخرائط ذهنية بالذكاء الاصطناعي — مجاناً',
  keywords: ['دراسة', 'مراجعة', 'ذكاء اصطناعي', 'study', 'AI', 'flashcards'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="bg-background text-text-primary antialiased" suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              color: '#F0F0FF',
            },
          }}
        />
      </body>
    </html>
  )
}
