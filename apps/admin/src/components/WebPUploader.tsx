'use client'

import { useState } from 'react'
import { compressImageToWebP } from '@/lib/imageCompressor'

interface Props {
  articleSlug: string
  coverImageUrl?: string
  onUploadComplete: (cdnUrl: string) => void
  onRemove?: () => void
}

export default function WebPUploader({ articleSlug, coverImageUrl, onUploadComplete, onRemove }: Props) {
  const [compressing, setCompressing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileSizeInfo, setFileSizeInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const processAndUpload = async (file: File) => {
    setError(null)
    setCompressing(true)

    try {
      const origSize = (file.size / 1024).toFixed(1)

      // 1. Client-Side HTML5 Canvas resize (max 1600px) & WebP compression
      const webpBlob = await compressImageToWebP(file, 1600, 1600, 0.82)
      const compressedSize = (webpBlob.size / 1024).toFixed(1)
      const percentReduction = Math.round((1 - webpBlob.size / file.size) * 100)
      setFileSizeInfo(`${origSize} KB → ${compressedSize} KB WebP (-${percentReduction}%)`)

      // 2. Upload to GitHub Contents API via server route
      const formData = new FormData()
      formData.append('file', webpBlob, `${articleSlug || 'cover'}.webp`)
      formData.append('slug', articleSlug || 'cover')

      const res = await fetch('/api/cdn/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload to CDN')
      }

      const data = await res.json()
      onUploadComplete(data.url)
    } catch (err: any) {
      setError(err.message || 'Image processing or upload failed')
    } finally {
      setCompressing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processAndUpload(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      await processAndUpload(file)
    }
  }

  const copyUrl = () => {
    if (coverImageUrl) {
      navigator.clipboard.writeText(coverImageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-3">
      {coverImageUrl ? (
        <div className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <img
            src={coverImageUrl}
            alt="Cover preview"
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                CDN WebP Active
              </span>
              {fileSizeInfo && <p className="text-[11px] font-mono text-slate-400">{fileSizeInfo}</p>}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyUrl}
                className="px-2.5 py-1 text-slate-600 hover:text-black font-mono border border-slate-200 rounded bg-slate-50 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy CDN URL'}
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-2.5 py-1 text-red-600 hover:text-red-800 font-medium border border-red-100 rounded hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragOver ? 'border-slate-900 bg-slate-100' : 'border-slate-200 bg-white hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            id="cdn-image-input"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="cdn-image-input" className="cursor-pointer block space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-lg">
              {compressing ? '⚙️' : '📸'}
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {compressing ? 'Compressing to WebP & Pushing to CDN...' : 'Drop cover image here or click to browse'}
            </div>
            <p className="text-xs text-slate-400">
              Canvas auto-resizes to 1600px WebP (~100–200 KB) & pushes directly to cdn.theopenbrief.app
            </p>
          </label>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <strong>Upload Error:</strong> {error}
        </div>
      )}
    </div>
  )
}
