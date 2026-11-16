'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import WebPUploader from '@/components/WebPUploader'

interface ArticleItem {
  id: string
  title: string
  slug: string
  section: 'journal' | 'explainers' | 'tech'
  status: string
  excerpt?: string
  content: string
  cover_image_url?: string
  author_name: string
  read_time_minutes: number
  published_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Current View
  const [activeTab, setActiveTab] = useState<'editor' | 'archive'>('editor')
  const [editorMode, setEditorMode] = useState<'edit' | 'split' | 'preview'>('edit')

  // Form Fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [section, setSection] = useState<'journal' | 'explainers' | 'tech'>('journal')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [authorName, setAuthorName] = useState('The Open Brief Desk')
  const [readTime, setReadTime] = useState(5)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Status & Notifications
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null)

  // Archive State
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'journal' | 'explainers' | 'tech'>('all')

  // Live Metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200))

  useEffect(() => {
    setReadTime(calculatedReadTime)
  }, [calculatedReadTime])

  // Load articles for archive
  const fetchArchive = async () => {
    setLoadingArticles(true)
    try {
      const res = await fetch('/api/articles')
      if (res.ok) {
        const data = await res.json()
        setArticles(data.docs || [])
      }
    } catch (err) {
      console.error('Failed to load articles:', err)
    } finally {
      setLoadingArticles(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'archive') {
      fetchArchive()
    }
  }, [activeTab])

  // Auto slug generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!editingId && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      )
    }
  }

  // Insert markdown shortcut
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = before + selectedText + after

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setCoverImageUrl('')
    setEditingId(null)
    setMessage(null)
  }

  const editArticle = (art: ArticleItem) => {
    setTitle(art.title)
    setSlug(art.slug)
    setSection(art.section)
    setExcerpt(art.excerpt || '')
    setContent(art.content)
    setCoverImageUrl(art.cover_image_url || '')
    setAuthorName(art.author_name || 'The Open Brief Desk')
    setReadTime(art.read_time_minutes || 5)
    setEditingId(art.id)
    setActiveTab('editor')
    setMessage(null)
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

      setMessage({
        type: 'success',
        text: `✓ Dispatch "${title}" published live to Neon PostgreSQL!`,
        link: `https://theopenbrief.app/articles/${slug}`,
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: `Publication error: ${err.message}` })
    } finally {
      setPublishing(false)
    }
  }

  const filteredArticles = archiveFilter === 'all'
    ? articles
    : articles.filter((a) => a.section === archiveFilter)

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* ── Studio Masthead Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="TOB" className="w-7 h-7 rounded object-contain shadow-sm" />
            <div className="leading-tight">
              <span className="font-serif font-bold text-base text-slate-900 tracking-tight block">
                The Open Brief
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Author Studio
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium ml-4">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-black'
              }`}
            >
              ✍️ Writing Desk
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'archive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-black'
              }`}
            >
              📰 Dispatches Archive
            </button>
          </div>
        </div>

        {/* Live Metrics & Actions */}
        <div className="flex items-center gap-4">
          {activeTab === 'editor' && (
            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400 border-r border-slate-200 pr-4">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{readTime} min read</span>
            </div>
          )}

          <a
            href="https://theopenbrief.app"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-slate-500 hover:text-black transition-colors hidden sm:inline"
          >
            Live Reader ↗
          </a>

          <button
            onClick={handleLogout}
            className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Tab Views ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <span>{message.text}</span>
            {message.link && (
              <a
                href={message.link}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs underline font-semibold text-emerald-800 hover:text-emerald-950"
              >
                View Live Dispatch ↗
              </a>
            )}
          </div>
        )}

        {/* ── TAB 1: Writing Desk ── */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Writing Area (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Publication Pillar Segmented Picker */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-semibold">
                  Publication Pillar
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'journal', label: 'OpenBrief Plus', desc: 'Essays & Long-form', icon: '✒️' },
                    { id: 'explainers', label: 'TOB Explainers', desc: 'Visual Deep Dives', icon: '🔍' },
                    { id: 'tech', label: 'TechnoBrief', desc: 'Engineering Bites', icon: '⚡' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSection(p.id as any)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        section === p.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{p.icon}</span>
                        <span className="font-semibold text-sm">{p.label}</span>
                      </div>
                      <span className={`text-[11px] block ${section === p.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  placeholder="Article Headline..."
                  className="w-full text-2xl sm:text-4xl font-serif font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 leading-tight bg-transparent"
                />
              </div>

              {/* Standfirst / Subtitle Input */}
              <div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Standfirst / Excerpt — A sharp 2-3 sentence overview..."
                  className="w-full text-base sm:text-lg font-serif italic text-slate-600 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed"
                />
              </div>

              {/* Formatting Toolbar & Mode Switcher */}
              <div className="border-t border-b border-slate-100 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="px-2 py-1 font-semibold rounded hover:bg-slate-100 text-slate-700"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ')}
                    className="px-2 py-1 font-semibold rounded hover:bg-slate-100 text-slate-700"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="px-2 py-1 font-bold rounded hover:bg-slate-100 text-slate-700"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="px-2 py-1 italic rounded hover:bg-slate-100 text-slate-700 font-serif"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-serif"
                    title="Quote"
                  >
                    “ ”
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```\n', '\n```')}
                    className="px-2 py-1 font-mono rounded hover:bg-slate-100 text-slate-700"
                    title="Code Block"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n---\n')}
                    className="px-2 py-1 font-mono rounded hover:bg-slate-100 text-slate-700"
                    title="Divider"
                  >
                    — Divider
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    className={`px-2 py-1 rounded ${editorMode === 'edit' ? 'bg-white shadow-xs font-semibold' : 'text-slate-500'}`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('split')}
                    className={`px-2 py-1 rounded ${editorMode === 'split' ? 'bg-white shadow-xs font-semibold' : 'text-slate-500'}`}
                  >
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-2 py-1 rounded ${editorMode === 'preview' ? 'bg-white shadow-xs font-semibold' : 'text-slate-500'}`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Main Body Canvas */}
              {editorMode === 'edit' && (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={18}
                  placeholder="Dispatched from Adoor... Write your essay, visual explainer breakdown, or systems note in Markdown..."
                  className="w-full text-base font-sans text-slate-800 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 resize-y leading-relaxed bg-transparent"
                />
              )}

              {editorMode === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[420px]">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={18}
                    placeholder="Markdown draft..."
                    className="w-full text-sm font-mono text-slate-800 border border-slate-200 rounded-lg p-3 resize-none outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 overflow-y-auto max-h-[500px] text-sm leading-relaxed space-y-4">
                    <MarkdownViewer content={content} />
                  </div>
                </div>
              )}

              {editorMode === 'preview' && (
                <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200 min-h-[400px]">
                  <h1 className="editorial-serif text-3xl font-bold mb-4">{title || 'Untitled'}</h1>
                  {excerpt && <p className="editorial-serif italic text-lg text-slate-600 mb-6">{excerpt}</p>}
                  <MarkdownViewer content={content} />
                </div>
              )}
            </div>

            {/* Sidebar Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Publishing Actions Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                    Dispatch Status
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    {editingId ? 'Editing Live' : 'Ready to Publish'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full py-3 px-4 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                >
                  {publishing ? (
                    <span>Publishing to Neon...</span>
                  ) : (
                    <span>{editingId ? 'Update Live Dispatch' : 'Publish to Neon & Live Site'}</span>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full py-2 text-xs font-mono text-slate-500 hover:text-black border border-slate-200 rounded-lg transition-colors"
                  >
                    Cancel Edit & Clear Form
                  </button>
                )}
              </div>

              {/* Cover Image Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                  Cover Image (Zero-Card CDN)
                </label>
                <WebPUploader
                  articleSlug={slug}
                  coverImageUrl={coverImageUrl}
                  onUploadComplete={(url) => setCoverImageUrl(url)}
                  onRemove={() => setCoverImageUrl('')}
                />
              </div>

              {/* Metadata Details Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold pb-2 border-b border-slate-100">
                  Metadata & Byline
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="article-slug"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    theopenbrief.app/articles/{slug || '...'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author Byline
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Read Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={readTime}
                    onChange={(e) => setReadTime(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ── TAB 2: Dispatches Archive ── */}
        {activeTab === 'archive' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Dispatches in Neon PostgreSQL</h2>
                <p className="text-xs text-slate-500 mt-1">Manage and edit your published stories</p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {(['all', 'journal', 'explainers', 'tech'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setArchiveFilter(sec)}
                    className={`px-3 py-1.5 rounded-lg border capitalize ${
                      archiveFilter === sec
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {loadingArticles ? (
              <div className="py-12 text-center text-sm font-mono text-slate-400">
                Loading published dispatches from database...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 space-y-3">
                <p>No dispatches found in this section.</p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-mono"
                >
                  Draft First Dispatch →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredArticles.map((art) => (
                  <div key={art.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {art.section}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(art.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base">{art.title}</h3>
                      <p className="text-xs text-slate-500 font-mono">
                        by {art.author_name} • {art.read_time_minutes} min read • /{art.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editArticle(art)}
                        className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg hover:border-black transition-colors"
                      >
                        Edit in Studio
                      </button>
                      <a
                        href={`https://theopenbrief.app/articles/${art.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-mono text-slate-500 hover:text-black"
                      >
                        Live ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MarkdownViewer({ content }: { content: string }) {
  if (!content) return <p className="text-slate-400 italic">No content written yet...</p>

  return (
    <div className="space-y-4">
      {content.split('\n\n').map((block, idx) => {
        const text = block.trim()
        if (text.startsWith('## ')) {
          return <h2 key={idx} className="font-serif font-bold text-xl text-slate-900 mt-4">{text.replace('## ', '')}</h2>
        }
        if (text.startsWith('### ')) {
          return <h3 key={idx} className="font-serif font-bold text-lg text-slate-900 mt-3">{text.replace('### ', '')}</h3>
        }
        if (text.startsWith('> ')) {
          return <blockquote key={idx} className="font-serif italic border-l-2 border-slate-900 pl-4 text-slate-700 my-2">{text.replace('> ', '')}</blockquote>
        }
        if (text.startsWith('```')) {
          return <pre key={idx} className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto">{text.replace(/```/g, '')}</pre>
        }
        return <p key={idx} className="text-slate-700 leading-relaxed">{text}</p>
      })}
    </div>
  )
}
