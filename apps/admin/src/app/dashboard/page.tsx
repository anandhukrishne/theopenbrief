'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import WebPUploader from '@/components/WebPUploader'
import { clientAuth } from '@/lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'

interface UserProfile {
  id: string
  email: string
  name: string
  bio?: string
  role: 'admin' | 'editor' | 'writer'
}

interface ArticleItem {
  id: string
  title: string
  slug: string
  section: 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone'
  status: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  cover_image_caption?: string
  author_id?: string
  author_name: string
  author_bio?: string
  author_avatar_url?: string
  read_time_minutes: number
  published_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // User Profile & Role
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Current View
  const [activeTab, setActiveTab] = useState<'editor' | 'archive' | 'profile'>('editor')
  const [editorMode, setEditorMode] = useState<'edit' | 'split' | 'preview'>('edit')

  // Form Fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [section, setSection] = useState<'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone'>('journal')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageCaption, setCoverImageCaption] = useState('')
  const [showImageInserter, setShowImageInserter] = useState(false)
  const [readTime, setReadTime] = useState(5)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null)

  // Status & Notifications
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Archive State
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone'>('all')

  // Live Metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200))

  useEffect(() => {
    setReadTime(calculatedReadTime)
  }, [calculatedReadTime])

  // Load user profile
  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setProfile(data.profile)
          setProfileName(data.profile.name)
          setProfileBio(data.profile.bio || '')
          setProfileAvatarUrl(data.profile.avatar_url || '')
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Refresh Firebase session cookie whenever auth state is confirmed (fixes token expiry after browser restart)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      if (user) {
        try {
          const freshToken = await user.getIdToken(true) // force refresh
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: freshToken }),
          })
          // Re-sync profile after session refresh
          await loadProfile()
        } catch (e) {
          console.error('Session refresh failed', e)
        }
      }
    })
    return () => unsubscribe()
  }, [])

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

  // Insert markdown link
  const insertLink = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const url = window.prompt('Enter link URL (e.g. https://...):', 'https://')
    if (!url) return

    const text = selectedText || window.prompt('Enter link text:', 'link text') || 'link'
    const replacement = `[${text}](${url})`
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
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
    setCoverImageCaption('')
    setEditingId(null)
    setEditingAuthorId(null)
    setMessage(null)
  }

  const editArticle = async (artId: string) => {
    try {
      const res = await fetch(`/api/articles?id=${artId}`)
      if (!res.ok) throw new Error('Failed to fetch article')
      const data = await res.json()
      const art: ArticleItem = data.docs?.[0] || data
      setTitle(art.title)
      setSlug(art.slug)
      setSection(art.section)
      setExcerpt(art.excerpt || '')
      setContent(art.content || '')
      setCoverImageUrl(art.cover_image_url || '')
      setCoverImageCaption(art.cover_image_caption || '')
      setReadTime(art.read_time_minutes || 5)
      setEditingId(art.id)
      setEditingAuthorId(art.author_id || null)
      setActiveTab('editor')
      setMessage(null)
    } catch (err) {
      console.error('Failed to load article for editing:', err)
    }
  }

  // Delete an article
  const handleDeleteArticle = async (id: string, artTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${artTitle}"? This cannot be undone.`)) {
      return
    }

    setDeleting(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/articles?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete article')
      }

      setMessage({ type: 'success', text: `Article "${artTitle}" has been permanently deleted.` })
      if (editingId === id) resetForm()
      fetchArchive()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setDeleting(false)
    }
  }

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, bio: profileBio, avatar_url: profileAvatarUrl }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const data = await res.json()
      setProfile(data.profile)
      setMessage({ type: 'success', text: 'Your profile has been updated successfully.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSavingProfile(false)
    }
  }

  // Submit / Publish Article
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPublishing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          title,
          slug,
          section,
          excerpt,
          content,
          cover_image_url: coverImageUrl,
          cover_image_caption: coverImageCaption,
          read_time_minutes: Number(readTime),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to publish article')
      }

      setMessage({
        type: 'success',
        text: `Article "${title}" published live to Neon PostgreSQL!`,
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

  // Can the current user delete/edit the article currently in the form?
  const canEditCurrent =
    !editingId ||
    profile?.role === 'admin' ||
    profile?.role === 'editor' ||
    editingAuthorId === profile?.id

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* ── Studio Navigation Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="TOB" className="w-7 h-7 rounded object-contain shadow-xs" />
            <div className="leading-tight">
              <span className="font-bold text-sm text-slate-900 tracking-tight block">
                The Open Brief
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Author Studio
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium ml-4">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Writing Desk
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'archive' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Articles ({articles.length})
            </button>
          </div>
        </div>

        {/* Live Metrics & User Profile Dropdown */}
        <div className="flex items-center gap-3">
          <a
            href="https://theopenbrief.app"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-slate-500 hover:text-black transition-colors hidden sm:inline"
          >
            Live Site ↗
          </a>

          {/* User Badge with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((v) => !v)}
              className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-slate-400 transition-colors cursor-pointer select-none"
            >
              <span className="font-semibold text-slate-800">{profile?.name || 'Author'}</span>
              <span
                className={`uppercase text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  profile?.role === 'admin'
                    ? 'bg-rose-100 text-rose-800'
                    : profile?.role === 'editor'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {profile?.role || 'Author'}
              </span>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-sans">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900 truncate">{profile?.name || 'Author'}</div>
                  <div className="text-slate-400 font-mono text-[11px] truncate">{profile?.email}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile')
                    setProfileDropdownOpen(false)
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  My Profile &amp; Settings
                </button>

                <a
                  href="https://theopenbrief.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  View Live Site ↗
                </a>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
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
                View Live Article ↗
              </a>
            )}
          </div>
        )}

        {/* ── TAB 1: Writing Desk ── */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Writing Area (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Publication Pillar Selector (Including Standalone) */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-semibold">
                  Select Publication Pillar or Standalone
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    {
                      id: 'journal',
                      label: 'OpenBrief Plus',
                      desc: 'Long-Form Essays',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.2 20.4 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'explainers',
                      label: 'TOB Explainers',
                      desc: 'Visual Deep Dives',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'tech',
                      label: 'TechnoBrief',
                      desc: 'Engineering Bites',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M7 16l-4-4 4-4 1.41 1.41L5.83 12l2.58 2.59L7 16zm10 0l-1.41-1.41L18.17 12l-2.58-2.59L17 8l4 4-4 4zM10.84 18l3-12h1.32l-3 12h-1.32z"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'cinebrief',
                      label: 'CinēBrief',
                      desc: 'Cinema & Arts',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'standalone',
                      label: 'General',
                      desc: 'Standalone Articles',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      ),
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSection(p.id as any)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        section === p.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="shrink-0">{p.icon}</span>
                        <span className="font-semibold text-xs truncate">{p.label}</span>
                      </div>
                      <span className={`text-[10px] block truncate ${section === p.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Attribution Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Publishing as: <strong className="text-slate-900">{profile?.name || 'Verified Author'}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Verified author attribution</span>
              </div>

              {/* Title Input (Sans-Serif) */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  placeholder="Article Headline..."
                  className="w-full text-2xl sm:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 leading-tight bg-transparent tracking-tight"
                />
              </div>

              {/* Standfirst / Subtitle Input */}
              <div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Standfirst / Excerpt — A sharp 2-3 sentence overview..."
                  className="w-full text-base sm:text-lg text-slate-600 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed"
                />
              </div>

              {/* Formatting Toolbar */}
              <div className="border-t border-b border-slate-100 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="px-2 py-1 font-bold rounded hover:bg-slate-100 text-slate-700"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ')}
                    className="px-2 py-1 font-bold rounded hover:bg-slate-100 text-slate-700"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="px-2 py-1 font-extrabold rounded hover:bg-slate-100 text-slate-700"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="px-2 py-1 italic rounded hover:bg-slate-100 text-slate-700"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium"
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
                    onClick={() => insertMarkdown('\n\n---\n\n')}
                    className="px-2 py-1 font-mono rounded hover:bg-slate-100 text-slate-700"
                    title="Divider"
                  >
                    — Divider
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    className="px-2 py-1 font-mono rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1"
                    title="Insert Link"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                    Link
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
                  placeholder="Write your article or technical breakdown here in clean Markdown..."
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
                  <h1 className="text-3xl font-extrabold mb-4 tracking-tight">{title || 'Untitled'}</h1>
                  {excerpt && <p className="text-lg text-slate-600 mb-6">{excerpt}</p>}
                  <MarkdownViewer content={content} />
                </div>
              )}
            </div>

            {/* Sidebar Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Publishing Actions Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                    Article Status
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    {editingId ? 'Editing Article' : 'New Article'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={publishing || !canEditCurrent}
                  className="w-full py-3 px-4 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                >
                  {publishing ? (
                    <span>Saving to Neon...</span>
                  ) : (
                    <span>{editingId ? 'Update Live Article' : 'Publish Article'}</span>
                  )}
                </button>

                {editingId && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full py-2 text-xs font-mono text-slate-600 hover:text-black border border-slate-200 rounded-lg transition-colors"
                    >
                      Clear & Start New Blank Draft
                    </button>

                    {canEditCurrent && (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => handleDeleteArticle(editingId, title)}
                        className="w-full py-2 text-xs font-mono text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {deleting ? (
                          'Deleting...'
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Delete Article
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Image Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                  Cover Image
                </label>
                <WebPUploader
                  coverImageUrl={coverImageUrl}
                  onUploadComplete={(dataUrl) => setCoverImageUrl(dataUrl)}
                  onRemove={() => setCoverImageUrl('')}
                />
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Image Caption / Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={coverImageCaption}
                    onChange={(e) => setCoverImageCaption(e.target.value)}
                    placeholder="e.g. Photo courtesy of Warner Bros. / Illustration by 45 STUDioS"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Metadata Details Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <span className="block text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold pb-2 border-b border-slate-100">
                  Metadata & Settings
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

        {/* ── TAB 2: Articles Archive with Delete Options & Hierarchy ── */}
        {activeTab === 'archive' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Articles in Neon Database</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage, edit, or delete published articles ({profile?.role?.toUpperCase()} permissions active)
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto">
                {(['all', 'journal', 'explainers', 'tech', 'cinebrief', 'standalone'] as const).map((sec) => (
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
                Loading published articles from database...
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
                {filteredArticles.map((art) => {
                  const canManage =
                    profile?.role === 'admin' ||
                    profile?.role === 'editor' ||
                    art.author_id === profile?.id

                  return (
                    <div
                      key={art.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-3 rounded-xl transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {art.section}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{art.title}</h3>
                        <p className="text-xs text-slate-500 font-mono">
                          by {art.author_name} • {art.read_time_minutes} min read • /{art.slug}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => editArticle(art.id)}
                              className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg hover:border-black transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="px-3 py-1.5 text-xs font-mono text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-mono text-slate-400 italic">Read-only</span>
                        )}
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
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: My Profile (Editable by Owner Only) ── */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Author Profile</h2>
              <p className="text-xs text-slate-500 mt-1">
                Editable only by you. Your name and bio will appear on all dispatches you publish.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Email
                </label>
                <input
                  type="text"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Editorial Role
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-mono uppercase font-bold rounded-lg bg-slate-900 text-white">
                    {profile?.role}
                  </span>
                  <span className="text-xs text-slate-400">
                    {profile?.role === 'admin'
                      ? 'Full system access (edit/delete any article)'
                      : profile?.role === 'editor'
                      ? 'Editorial privileges (edit/delete any article)'
                      : 'Writer privileges (create and manage your own articles only)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Author Photo / Avatar (Compressed WebP)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center shrink-0">
                    {profileAvatarUrl ? (
                      <img src={profileAvatarUrl} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-400 text-lg">
                        {(profileName || 'A').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <WebPUploader
                      coverImageUrl={profileAvatarUrl}
                      onUploadComplete={(dataUrl) => setProfileAvatarUrl(dataUrl)}
                      onRemove={() => setProfileAvatarUrl('')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display / Byline Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  placeholder="e.g. Anandhu Krishna"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Author Bio
                </label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={3}
                  placeholder="A short sentence or two about your editorial background or focus area..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-6 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Admin Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} The Open Brief. Author Studio. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Developed by 45 STUDioS</span>
            <span>•</span>
            <a
              href="https://theopenbrief.app"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-black transition-colors underline"
            >
              theopenbrief.app ↗
            </a>
          </div>
        </div>
      </footer>
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
          return <h2 key={idx} className="font-bold text-xl text-slate-900 mt-4 tracking-tight">{text.replace('## ', '')}</h2>
        }
        if (text.startsWith('### ')) {
          return <h3 key={idx} className="font-bold text-lg text-slate-900 mt-3 tracking-tight">{text.replace('### ', '')}</h3>
        }
        if (text.startsWith('> ')) {
          return <blockquote key={idx} className="border-l-2 border-slate-900 pl-4 text-slate-700 my-2 font-medium">{text.replace('> ', '')}</blockquote>
        }
        if (text.startsWith('```')) {
          return <pre key={idx} className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto">{text.replace(/```/g, '')}</pre>
        }
        return <p key={idx} className="text-slate-700 leading-relaxed">{text}</p>
      })}
    </div>
  )
}
