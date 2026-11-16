'use client'

import { useState } from 'react'
import { compressImageToDataUrlWebP } from '@/lib/imageCompressor'

interface Props {
  coverImageUrl?: string
  onUploadComplete: (dataUrl: string) => void
  onRemove?: () => void
}

export default function WebPUploader({ coverImageUrl, onUploadComplete, onRemove }: Props) {
  const [compressing, setCompressing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileSizeInfo, setFileSizeInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processImage = async (file: File) => {
    setError(null)
    setCompressing(true)

    try {
      // Direct high-efficiency client-side WebP compression
      const { dataUrl, originalSizeKb, compressedSizeKb } = await compressImageToDataUrlWebP(file, 1200, 900, 0.72)
      const reduction = Math.round((1 - compressedSizeKb / Math.max(originalSizeKb, 1)) * 100)
      setFileSizeInfo(`${originalSizeKb} KB → ${compressedSizeKb} KB WebP (-${reduction}%)`)

      // Stored directly with article record in database
      onUploadComplete(dataUrl)
    } catch (err: any) {
      setError(err.message || 'Image processing failed')
    } finally {
      setCompressing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processImage(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      await processImage(file)
    }
  }

  return (
    <div className="space-y-3">
      {coverImageUrl ? (
        <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <img
            src={coverImageUrl}
            alt="Cover preview"
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Compressed WebP (Saved with Article)
              </span>
              {fileSizeInfo && <p className="text-[11px] font-mono text-slate-400">{fileSizeInfo}</p>}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="cover-image-replace"
                className="px-2.5 py-1 text-slate-700 hover:text-black font-medium border border-slate-200 rounded-lg bg-slate-50 cursor-pointer transition-colors"
              >
                Replace
              </label>
              <input
                type="file"
                id="cover-image-replace"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-2.5 py-1 text-red-600 hover:text-red-800 font-medium border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
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
            id="cover-image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="cover-image-upload" className="cursor-pointer block space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-lg">
              {compressing ? '⚙️' : '📸'}
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {compressing ? 'Compressing to WebP...' : 'Add Cover Image (Auto-Compressed WebP)'}
            </div>
            <p className="text-xs text-slate-400">
              Client-side HTML5 canvas compresses to ~35-65 KB and embeds directly into article data.
            </p>
          </label>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <strong>Image Error:</strong> {error}
        </div>
      )}
    </div>
  )
}
