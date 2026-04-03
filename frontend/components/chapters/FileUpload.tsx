'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { filesApi } from '@/lib/api'
import { toast } from 'sonner'
import ChapterSplitDialog from './ChapterSplitDialog'

interface Props {
  subjectId: string
  chapterId?: string
  onClose: () => void
  onSuccess: (fileId: string) => void
}

export default function FileUpload({ subjectId, chapterId, onClose, onSuccess }: Props) {
  const { t, isRTL } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'text/plain': ['.txt'],
    },
    onDropRejected: () => toast.error(t('errors.unsupportedFormat')),
  })

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(20)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('subject_id', subjectId)
      if (chapterId) formData.append('chapter_id', chapterId)

      setProgress(50)
      const res = await filesApi.upload(formData)
      setProgress(100)
      setUploadedFileId(res.data.id)
      setUploaded(true)

      // Start processing
      await filesApi.process(res.data.id)

      if (!chapterId) {
        setShowSplitDialog(true)
      } else {
        onSuccess(res.data.id)
      }
    } catch (err: any) {
      if (err?.response?.data?.detail?.includes('50MB')) {
        toast.error(t('errors.fileTooLarge'))
      } else {
        toast.error(err?.response?.data?.detail || t('errors.generic'))
      }
      setUploading(false)
      setProgress(0)
    }
  }

  if (showSplitDialog && uploadedFileId) {
    return (
      <ChapterSplitDialog
        fileId={uploadedFileId}
        subjectId={subjectId}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass rounded-2xl shadow-glow overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(108,99,255,0.2)' }}>
          <h2 className="font-bold text-text-primary">{t('chapters.uploadFile')}</h2>
          <button onClick={onClose} disabled={uploading}><X className="w-5 h-5 text-text-secondary" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            } ${file ? 'bg-primary/5' : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="font-medium text-text-primary truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-text-secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-text-secondary mx-auto mb-3" />
                <p className="text-text-primary font-medium mb-1">{t('chapters.dragDrop')}</p>
                <p className="text-xs text-text-secondary">{t('chapters.supportedFormats')}</p>
                <p className="text-xs text-text-secondary mt-1">{t('chapters.maxSize')}</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">
                  {progress < 100 ? t('chapters.processing') : t('chapters.processingDesc')}
                </span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} disabled={uploading}
              className="flex-1 bg-surface-2 text-text-secondary rounded-xl py-2.5 text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50">
              {t('common.cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {t('common.upload')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
