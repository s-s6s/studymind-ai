'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen, Brain, Zap, GitBranch, MessageSquare,
  TrendingUp, Upload, Cpu, Star, ChevronRight,
  FileText, Layers, Key
} from 'lucide-react'

const features = [
  { icon: FileText, title: 'Smart Summaries', desc: 'Concise or detailed summaries from your files', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Layers, title: 'Flashcards', desc: 'Interactive flip cards with animations', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Zap, title: 'MCQ Quizzes', desc: 'Instant quizzes with corrections and explanations', color: 'text-warning', bg: 'bg-warning/10' },
  { icon: BookOpen, title: 'Cheat Sheets', desc: 'Condensed key information in one place', color: 'text-success', bg: 'bg-success/10' },
  { icon: GitBranch, title: 'Mind Maps', desc: 'Interactive visual maps for concepts', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { icon: MessageSquare, title: 'AI Assistant', desc: 'Ask anything about your subject', color: 'text-orange-400', bg: 'bg-orange-400/10' },
]

const steps = [
  { step: '01', icon: Upload, title: 'Upload Your Files', desc: 'PDF, Word, PowerPoint, or images' },
  { step: '02', icon: Cpu, title: 'AI Analyzes', desc: 'Content analysis and automatic study material generation' },
  { step: '03', icon: Star, title: 'Study & Excel', desc: 'Summaries, flashcards, quizzes, mind maps, and AI assistant' },
]

const faqs = [
  {
    q: 'Is the platform completely free?',
    a: 'Yes! StudyMind AI is 100% free with no fees or paid plans.',
  },
  {
    q: 'How does the AI work?',
    a: 'You add your own API key from OpenAI, Anthropic, or Google, and pay only the AI provider directly.',
  },
  {
    q: 'What file types are supported?',
    a: 'PDF, Word (DOCX), PowerPoint (PPTX), Images (PNG/JPG), and text files (TXT).',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes, API keys are encrypted with AES-256, and your files are securely stored.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">StudyMind AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link href="/register"
              className="bg-primary hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors glow-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full mb-6 border border-primary/20">
              <Zap className="w-3 h-3" />
              Free Forever — No Credit Card Required
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight mb-6">
              Transform Your Files Into a{' '}
              <span className="gradient-text">Smart Study Experience</span>
            </h1>
            <p className="text-lg text-text-secondary mb-10 leading-relaxed">
              Upload your study files and get summaries, flashcards, quizzes, and mind maps
              powered by AI — completely free
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all glow-primary text-base">
                <Brain className="w-5 h-5" />
                Start Now — Free
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="#features"
                className="inline-flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-3 text-text-primary font-medium px-8 py-3.5 rounded-xl transition-all border border-border text-base">
                View Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">Everything You Need to Excel</h2>
            <p className="text-text-secondary mt-3">All AI-powered study tools in one platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 hover:shadow-glow transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-text-secondary text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-surface-2/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">How It Works</h2>
            <p className="text-text-secondary mt-3">3 simple steps to supercharge your study</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary mb-1.5">{s.title}</h3>
                <p className="text-text-secondary text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Free highlight */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">Simple Pricing</h2>
            <p className="text-text-secondary mt-3">No subscriptions, no hidden fees</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 border-primary/30"
            >
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Free Forever</h3>
              <p className="text-text-secondary text-sm">All features unlocked — no paid plans or usage limits</p>
              <p className="text-3xl font-bold text-success mt-4">$0</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Bring Your Key</h3>
              <p className="text-text-secondary text-sm">Use your own API key from OpenAI, Anthropic, or Google</p>
              <p className="text-3xl font-bold text-primary mt-4">BYOK</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-surface-2/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5"
              >
                <h4 className="font-semibold text-text-primary mb-2">{faq.q}</h4>
                <p className="text-text-secondary text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10"
          >
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-text-primary mb-3">Ready to Study Smarter?</h2>
            <p className="text-text-secondary mb-8">Join thousands of students using AI to supercharge their learning</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all glow-primary text-base">
              <Brain className="w-5 h-5" />
              Start Free Today
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <p className="text-text-secondary text-sm">All rights reserved © StudyMind AI 2024</p>
      </footer>
    </div>
  )
}
