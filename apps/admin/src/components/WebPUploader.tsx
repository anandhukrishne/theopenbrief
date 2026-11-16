'use client'

import { useState } from 'react'
import { compressImageToWebP } from '@/lib/imageCompressor'

interface Props {
  articleSlug: string
  onUploadComplete: (cdnUrl: string) => void
}

export default function WebPUploader({ articleSlug, onUploadComplete }: Props) {
  const [compressing, setCompressing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileSizeInfo, setFileSizeInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setCompressing(true)

    try {
      const origSize = (file.size / 1024).toFixed(1)
      
      // 1. Client-Side HTML5 Canvas resize (max 1600px) & WebP compression
      const webpBlob = await compressImageToWebP(file, 1600, 1600, 0.82)
      const compressedSize = (webpBlob.size / 1024).toFixed(1)
      setFileSizeInfo(`Original: ${origSize} KB → WebP: ${compressedSize} KB (-${Math.round((1 - webpBlob.size / file.size) * 100)}%)`)

      // Local preview
      setPreview(URL.createObjectURL(webpBlob))

      // 2. Upload to GitHub Contents API via server route
      const formData = new FormData()
      formData.append('file', webpBlob, `${articleSlug || 'image'}.webp`)
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

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <input
        type="file"
        id="cdn-image-input"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-3">
          <img src={preview} alt="Compressed preview" className="max-h-48 mx-auto rounded-lg shadow-sm border border-slate-200 object-cover" />
          {fileSizeInfo && <p className="text-xs font-mono text-emerald-600 font-medium">{fileSizeInfo}</p>}
          <label
            htmlFor="cdn-image-input"
            className="inline-block cursor-pointer text-xs font-medium text-slate-700 underline hover:text-black"
          >
            Replace Image
          </label>
        </div>
      ) : (
        <label htmlFor="cdn-image-input" className="cursor-pointer block space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 text-lg">
            📷
          </div>
          <div className="text-sm font-medium text-slate-700">
            {compressing ? 'Compressing to WebP & Pushing to CDN...' : 'Upload Cover Image'}
          </div>
          <p className="text-xs text-slate-400">
            Automatically resized to max 1600px width & converted to WebP via HTML5 Canvas
          </p>
        </label>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
