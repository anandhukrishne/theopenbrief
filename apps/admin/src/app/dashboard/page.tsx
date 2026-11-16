'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import WebPUploader from '@/components/WebPUploader'

export default function Dashboard() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [section, setSection] = useState<'journal' | 'explainers' | 'tech'>('journal')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [authorName, setAuthorName] = useState('The Open Brief Desk')
  const [readTime, setReadTime] = useState(5)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      )
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPublishing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          section,
          excerpt,
          content,
          cover_image_url: coverImageUrl,
          author_name: authorName,
          read_time_minutes: Number(readTime),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to publish article')
      }

      setMessage('✓ Article published to Neon PostgreSQL successfully!')
      // Reset form
      setTitle('')
      setSlug('')
      setExcerpt('')
      setContent('')
      setCoverImageUrl('')
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Studio Header ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="The Open Brief" className="h-7 w-auto object-contain" />
          <span className="text-xs uppercase tracking-wider font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            Author Studio
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://theopenbrief.app"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 hover:text-black"
          >
            View Live Site ↗
          </a>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Publishing Workspace ── */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Draft & Publish</h1>
              <p className="text-xs text-slate-500 mt-1">Publish editorial dispatches directly to Neon PostgreSQL</p>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-3.5 rounded-lg text-sm font-medium ${message.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  placeholder="e.g. The Architecture of Thought"
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Publication Pillar
                </label>
                <select
                  value={section}
                  onChange={(e: any) => setSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="journal">OpenBrief Plus (Journal)</option>
                  <option value="explainers">TOB Explainers</option>
                  <option value="tech">TechnoBrief</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g. the-architecture-of-thought"
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Author Byline
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* ── Cover Image Uploader (Zero-Card GitHub CDN Pipeline) ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Cover Image (Canvas WebP Compression → cdn.theopenbrief.app)
              </label>
              <WebPUploader
                articleSlug={slug}
                onUploadComplete={(url) => setCoverImageUrl(url)}
              />
              {coverImageUrl && (
                <p className="text-xs font-mono text-slate-500 mt-2 truncate">
                  CDN URL: <a href={coverImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{coverImageUrl}</a>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Standfirst / Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A sharp 2-3 sentence overview of this brief..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Article Body (Markdown or Plain Text)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                placeholder="Write your long-form essay, explainer breakdown, or tech dispatch..."
                className="w-full px-4 py-3 text-sm font-sans border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Read Time:</span>
                <input
                  type="number"
                  value={readTime}
                  onChange={(e) => setReadTime(Number(e.target.value))}
                  min={1}
                  className="w-16 px-2 py-1 text-center border border-slate-300 rounded"
                />
                <span>mins</span>
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="py-2.5 px-6 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                {publishing ? 'Publishing to Neon...' : 'Publish Dispatch'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
