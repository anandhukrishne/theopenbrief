'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import WebPUploader from '@/components/WebPUploader'
import { supabaseClient } from '@/lib/supabaseClient'

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
  is_story_of_the_day?: boolean
  read_time_minutes: number
  published_at: string
}

interface StaffMember {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'writer'
  beat?: string
  password_plain?: string
  created_at?: string
}

export default function Dashboard() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // User Profile & Role
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileBeat, setProfileBeat] = useState('')
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Current View
  const [activeTab, setActiveTab] = useState<'editor' | 'archive' | 'profile' | 'staff'>('editor')
  const [editorMode, setEditorMode] = useState<'edit' | 'split' | 'preview'>('edit')
  const [mobileCoverOpen, setMobileCoverOpen] = useState(true)
  const [mobileMetaOpen, setMobileMetaOpen] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [section, setSection] = useState<'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone'>('journal')
  const [isStoryOfTheDay, setIsStoryOfTheDay] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageCaption, setCoverImageCaption] = useState('')
  const [readTime, setReadTime] = useState(5)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null)

  // Status & Notifications
  const [publishing, setPublishing] = useState(false)
  const [purgingCache, setPurgingCache] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Staff & Password Access State (Admin & Editor only)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPassword, setStaffPassword] = useState('')
  const [staffRole, setStaffRole] = useState<'admin' | 'editor' | 'writer'>('writer')
  const [staffBeat, setStaffBeat] = useState('')
  const [savingStaff, setSavingStaff] = useState(false)
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null)
  const [editPasswordValue, setEditPasswordValue] = useState('')
  const [editRoleValue, setEditRoleValue] = useState<'admin' | 'editor' | 'writer'>('writer')
  const [updatingStaff, setUpdatingStaff] = useState(false)

  // Auto-dismiss status/success notifications after 15 seconds
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 15000)
    return () => clearTimeout(timer)
  }, [message])

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

  const [sessionChecked, setSessionChecked] = useState(false)

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
          setProfileBeat(data.profile.beat || '')
          setProfileAvatarUrl(data.profile.avatar_url || '')
          try {
            localStorage.setItem('openbrief_cached_profile', JSON.stringify(data.profile))
          } catch { }
        }
      } else if (res.status === 401) {
        try {
          localStorage.removeItem('openbrief_cached_profile')
        } catch { }
        router.replace('/login')
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setSessionChecked(true)
    }
  }

  useEffect(() => {
    try {
      const cached = localStorage.getItem('openbrief_cached_profile')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.name) {
          setProfile(parsed)
          setProfileName(parsed.name)
          setProfileBio(parsed.bio || '')
          setProfileBeat(parsed.beat || '')
          setProfileAvatarUrl(parsed.avatar_url || '')
        }
      }
    } catch { }

    loadProfile()
    fetchArchive()
    fetchStaff()
  }, [])

  // Refresh Supabase session cookie whenever auth state is confirmed
  useEffect(() => {
    let subscription: any = null
    try {
      const { data } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        if (!sessionChecked || profile !== null) return
        if (session?.access_token) {
          try {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken: session.access_token }),
            })
            await loadProfile()
          } catch (e) {
            console.error('Supabase session sync failed', e)
          }
        }
      })
      subscription = data?.subscription
    } catch (_) {
      // Server session cookie takes precedence
    }
    return () => {
      subscription?.unsubscribe?.()
    }
  }, [sessionChecked, profile])

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

  // Load newsroom staff roster
  const fetchStaff = async () => {
    setLoadingStaff(true)
    try {
      const res = await fetch('/api/staff')
      if (res.ok) {
        const data = await res.json()
        setStaffList(data.staff || [])
      }
    } catch (err) {
      console.error('Failed to load staff roster:', err)
    } finally {
      setLoadingStaff(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'staff') {
      fetchStaff()
    }
  }, [activeTab])

  // Create staff credentials
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingStaff(true)
    setMessage(null)

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          password: staffPassword,
          role: staffRole,
          beat: staffBeat,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to grant staff access')

      setMessage({ type: 'success', text: `Access credentials created for ${staffName} (${staffRole.toUpperCase()})!` })
      setStaffName('')
      setStaffEmail('')
      setStaffPassword('')
      setStaffBeat('')
      setStaffRole('writer')
      fetchStaff()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSavingStaff(false)
    }
  }

  // Update staff credentials / password
  const handleSaveStaffEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaffMember) return
    setUpdatingStaff(true)
    setMessage(null)

    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStaffMember.id,
          password: editPasswordValue || undefined,
          role: editRoleValue,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update credentials')

      setMessage({ type: 'success', text: `Credentials and role updated for ${editingStaffMember.name}!` })
      setEditingStaffMember(null)
      setEditPasswordValue('')
      fetchStaff()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUpdatingStaff(false)
    }
  }

  // Revoke staff member access
  const handleDeleteStaff = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Revoke staff access for "${memberName}"? This account will no longer be able to authenticate into the studio.`)) {
      return
    }

    try {
      const res = await fetch(`/api/staff?id=${memberId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete staff member')

      setMessage({ type: 'success', text: `Access revoked for "${memberName}".` })
      fetchStaff()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

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

    if (selectedText.trim()) {
      const replacement = `[${selectedText}](https://)`
      const newContent = content.substring(0, start) + replacement + content.substring(end)
      setContent(newContent)
      setTimeout(() => {
        textarea.focus()
        const urlStart = start + selectedText.length + 3
        const urlEnd = urlStart + 8
        textarea.setSelectionRange(urlStart, urlEnd)
      }, 10)
    } else {
      const replacement = `[link text](https://)`
      const newContent = content.substring(0, start) + replacement + content.substring(end)
      setContent(newContent)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 1, start + 10)
      }, 10)
    }
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem('openbrief_cached_profile')
    } catch { }
    try { await supabaseClient.auth.signOut() } catch (_) { }
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setIsStoryOfTheDay(false)
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
      setSection((art.section as any) === 'editions' ? 'standalone' : art.section)
      setIsStoryOfTheDay(Boolean(art.is_story_of_the_day))
      setExcerpt(art.excerpt || '')
      setContent(art.content || '')
      setCoverImageUrl(art.cover_image_url || '')
      setCoverImageCaption(art.cover_image_caption || '')
      setReadTime(art.read_time_minutes || 5)
      setEditingId(art.id)
      setEditingAuthorId(art.author_id || null)
      setActiveTab('editor')
      setMessage(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        body: JSON.stringify({ name: profileName, bio: profileBio, beat: profileBeat, avatar_url: profileAvatarUrl }),
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
  const publishArticle = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: 'Headline and article body are required before publishing.' })
      return
    }
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
          is_story_of_the_day: isStoryOfTheDay,
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
        text: `Article "${title}" published live!`,
        link: `https://theopenbrief.app/articles/${slug}`,
      })
      fetchArchive()
    } catch (err: any) {
      setMessage({ type: 'error', text: `Publication error: ${err.message}` })
    } finally {
      setPublishing(false)
    }
  }

  const handlePurgeSiteCache = async () => {
    setPurgingCache(true)
    setMessage(null)
    try {
      const res = await fetch('/api/revalidate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to purge live cache')
      setMessage({ type: 'success', text: 'Live site cache cleared across homepage, sections, and articles.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setPurgingCache(false)
    }
  }

  const handleToggleStoryOfTheDay = async (artId: string, currentlySelected: boolean) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: artId, is_story_of_the_day: !currentlySelected }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update Story of the Day')
      }
      setMessage({
        type: 'success',
        text: !currentlySelected
          ? 'Pinned as Story of the Day on the front page.'
          : 'Unpinned Story of the Day. Front page defaults to the latest article.',
      })
      fetchArchive()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await publishArticle()
  }

  const filteredArticles = archiveFilter === 'all'
    ? articles
    : articles.filter((a) => a.section === archiveFilter)

  const canEditCurrent =
    !editingId ||
    profile?.role === 'admin' ||
    profile?.role === 'editor' ||
    editingAuthorId === profile?.id

  const isStaffManager = profile?.role === 'admin' || profile?.role === 'editor'

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans pb-20 sm:pb-0">
      {/* ── Studio Navigation Header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center shrink-0">
            <img src="/favicon.png" alt="TheOpenBrief" className="w-8 h-8 rounded object-contain shadow-xs" />
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium ml-3">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
                }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Writing Desk
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('archive'); fetchArchive() }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'archive' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
                }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Articles ({articles.length})
            </button>
            {isStaffManager && (
              <button
                type="button"
                onClick={() => { setActiveTab('staff'); fetchStaff() }}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
                  }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                Staff &amp; Access
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics & User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeTab === 'editor' && editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="sm:hidden px-2.5 py-1.5 text-[11px] font-sans bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
            >
              + New
            </button>
          )}

          <a
            href="https://theopenbrief.app"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-sans text-slate-500 hover:text-black transition-colors hidden md:inline"
          >
            Live Site ↗
          </a>

          {/* User Badge with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans bg-slate-50 border border-slate-200 px-2 sm:px-2.5 py-1.5 rounded-lg hover:border-slate-400 transition-colors cursor-pointer select-none min-h-[36px]"
            >
              <span className="font-semibold text-slate-800 max-w-[92px] sm:max-w-[140px] truncate">
                {profile?.name || 'Author'}
              </span>
              <span
                className={`uppercase text-[10px] px-1.5 py-0.5 rounded font-bold ${profile?.role === 'admin'
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
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-sans">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900 truncate">{profile?.name || 'Author'}</div>
                  <div className="text-slate-400 font-sans text-[11px] truncate">{profile?.email}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile')
                    setProfileDropdownOpen(false)
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  My Profile &amp; Settings
                </button>

                {isStaffManager && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('staff')
                      setProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    Staff &amp; Password Access
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Tab Views ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${message.type === 'success'
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
                className="font-sans text-xs underline font-semibold text-emerald-800 hover:text-emerald-950 shrink-0"
              >
                View Live Article ↗
              </a>
            )}
          </div>
        )}

        {/* ── TAB 1: Writing Desk ── */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            {/* Primary Writing Area (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
              {/* Publication Pillar Selector (Horizontal scroll on mobile, 5-col grid on sm+) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-sans uppercase tracking-widest text-slate-400 font-semibold">
                    Section
                  </label>
                  <span className="text-[11px] font-sans text-slate-400 sm:hidden">
                    {wordCount}w • {readTime}m
                  </span>
                </div>
                <div className="flex sm:grid sm:grid-cols-6 gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                  {[
                    {
                      id: 'journal',
                      label: 'OpenBrief Plus',
                      desc: 'Long-Form Essays',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.2 20.4 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'explainers',
                      label: 'TOB Explainers',
                      desc: 'Visual Deep Dives',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'tech',
                      label: 'TechnoBrief',
                      desc: 'Engineering Bites',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M7 16l-4-4 4-4 1.41 1.41L5.83 12l2.58 2.59L7 16zm10 0l-1.41-1.41L18.17 12l-2.58-2.59L17 8l4 4-4 4zM10.84 18l3-12h1.32l-3 12h-1.32z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'cinebrief',
                      label: 'CinēBrief',
                      desc: 'Cinema & Arts',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'standalone',
                      label: 'General',
                      desc: 'Standalone Articles',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                      ),
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSection(p.id as any)}
                      className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all shrink-0 min-w-[132px] sm:min-w-0 snap-start ${section === p.id
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

              {/* Story of the Day Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-sans font-bold text-slate-900 block">
                    Feature as Story of the Day
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Pins this article to the lead slot on the homepage. By default, the latest article is used.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isStoryOfTheDay}
                    onChange={(e) => setIsStoryOfTheDay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Author Attribution Card */}
              <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-sans text-slate-600">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">
                    Byline: <strong className="text-slate-900">{profile?.name || 'Verified Author'}</strong>
                  </span>
                </div>
                <span className="hidden sm:inline text-[11px] text-slate-400 shrink-0">
                  {wordCount} words • {readTime} min read
                </span>
              </div>

              {/* Title Input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  placeholder="Article Headline..."
                  className="w-full text-xl sm:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 leading-tight bg-transparent tracking-tight"
                />
              </div>

              {/* Standfirst / Subtitle Input */}
              <div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Standfirst / Excerpt — A sharp 2-3 sentence overview..."
                  className="w-full text-sm sm:text-lg text-slate-600 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed"
                />
              </div>

              {/* Formatting Toolbar (Touch-sized on mobile) */}
              <div className="sticky top-[53px] sm:top-[61px] z-20 bg-white/95 backdrop-blur-xs border-t border-b border-slate-100 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs overflow-x-auto pb-0.5 sm:pb-0 max-w-full">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-bold rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-bold rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-extrabold rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 italic rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 font-medium shrink-0"
                    title="Quote"
                  >
                    “ ”
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```\n', '\n```')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-sans rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Code Block"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n\n---\n\n')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-sans rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Divider"
                  >
                    —
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-sans rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0"
                    title="Insert Link"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                    </svg>
                    Link
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-sans ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditorMode('edit')}
                    className={`px-2.5 py-1 rounded-md ${editorMode === 'edit' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-500'}`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('split')}
                    className={`hidden md:inline-block px-2.5 py-1 rounded-md ${editorMode === 'split' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-500'}`}
                  >
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-2.5 py-1 rounded-md ${editorMode === 'preview' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-500'}`}
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
                  rows={15}
                  placeholder="Write your article or technical breakdown here in clean Markdown..."
                  className="w-full text-[15px] sm:text-base font-sans text-slate-800 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 resize-y leading-relaxed bg-transparent min-h-[280px] sm:min-h-[380px]"
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
                    className="w-full text-sm font-sans text-slate-800 border border-slate-200 rounded-lg p-3 resize-none outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 overflow-y-auto max-h-[500px] text-sm leading-relaxed space-y-4">
                    <MarkdownViewer content={content} />
                  </div>
                </div>
              )}

              {editorMode === 'preview' && (
                <div className="p-4 sm:p-6 bg-slate-50/50 rounded-xl border border-slate-200 min-h-[320px]">
                  <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight text-slate-900">
                    {title || 'Untitled'}
                  </h1>
                  {excerpt && <p className="text-base sm:text-lg text-slate-600 mb-5 leading-relaxed">{excerpt}</p>}
                  <MarkdownViewer content={content} />
                </div>
              )}
            </div>

            {/* Sidebar Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              {/* Desktop Publishing Actions Card (Hidden on mobile since sticky bar handles it) */}
              <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-sans uppercase tracking-widest text-slate-400 font-semibold">
                    Article Status
                  </span>
                  <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    {editingId ? 'Editing Article' : 'New Article'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={publishing || !canEditCurrent}
                  className="w-full py-3 px-4 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                >
                  {publishing ? (
                    <span>Publishing...</span>
                  ) : (
                    <span>{editingId ? 'Update Live Article' : 'Publish Article'}</span>
                  )}
                </button>

                {editingId && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full py-2 text-xs font-sans text-slate-600 hover:text-black border border-slate-200 rounded-lg transition-colors"
                    >
                      Clear &amp; Start New Blank Draft
                    </button>

                    {canEditCurrent && (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => handleDeleteArticle(editingId, title)}
                        className="w-full py-2 text-xs font-sans text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {deleting ? 'Deleting...' : 'Delete Article'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Image Card (Collapsible on mobile) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
                <button
                  type="button"
                  onClick={() => setMobileCoverOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-left lg:pointer-events-none"
                >
                  <span className="text-xs font-sans uppercase tracking-widest text-slate-400 font-semibold">
                    Cover Image
                  </span>
                  <span className="text-xs font-sans text-slate-400 lg:hidden">
                    {mobileCoverOpen ? 'Hide −' : 'Show +'}
                  </span>
                </button>

                {mobileCoverOpen && (
                  <div className="space-y-3 pt-1">
                    <WebPUploader
                      coverImageUrl={coverImageUrl}
                      onUploadComplete={(dataUrl) => setCoverImageUrl(dataUrl)}
                      onRemove={() => setCoverImageUrl('')}
                    />
                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cover Image Caption / Label (Optional)
                      </label>
                      <input
                        type="text"
                        value={coverImageCaption}
                        onChange={(e) => setCoverImageCaption(e.target.value)}
                        placeholder="e.g. Photo courtesy of Warner Bros."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata Details Card (Collapsible on mobile) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                <button
                  type="button"
                  onClick={() => setMobileMetaOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-left lg:pb-2 lg:border-b lg:border-slate-100 lg:pointer-events-none"
                >
                  <span className="text-xs font-sans uppercase tracking-widest text-slate-400 font-semibold">
                    Metadata &amp; URL Slug
                  </span>
                  <span className="text-xs font-sans text-slate-400 lg:hidden">
                    {mobileMetaOpen ? 'Hide −' : 'Edit +'}
                  </span>
                </button>

                {(mobileMetaOpen || typeof window === 'undefined') && (
                  <div className="space-y-4">
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
                        className="w-full px-3 py-2 text-xs font-sans border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <p className="text-[11px] font-sans text-slate-400 mt-1 truncate">
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
                )}

                {/* Always visible on desktop even if mobileMetaOpen is false */}
                {!mobileMetaOpen && (
                  <div className="hidden lg:block space-y-4">
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
                        className="w-full px-3 py-2 text-xs font-sans border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <p className="text-[11px] font-sans text-slate-400 mt-1 truncate">
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
                )}
              </div>

              {/* Mobile Delete Action when editing an existing post */}
              {editingId && canEditCurrent && (
                <div className="lg:hidden">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => handleDeleteArticle(editingId, title)}
                    className="w-full py-2.5 text-xs font-sans text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete This Article'}
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* ── TAB 2: Articles Archive ── */}
        {activeTab === 'archive' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Published Articles</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage, edit, or delete stories ({profile?.role?.toUpperCase()} access)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePurgeSiteCache}
                  disabled={purgingCache}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-900 hover:text-black text-xs font-sans font-semibold transition-colors disabled:opacity-50 shrink-0"
                >
                  {purgingCache ? 'Refreshing...' : 'Refresh Live Cache'}
                </button>
              </div>
            </div>

            {/* Filter Strip */}
            <div className="flex items-center gap-1.5 text-xs font-sans overflow-x-auto pb-1">
              {(['all', 'journal', 'explainers', 'tech', 'cinebrief', 'standalone'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setArchiveFilter(sec)}
                  className={`px-3 py-1.5 rounded-lg border capitalize shrink-0 ${archiveFilter === sec
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {loadingArticles ? (
              <div className="py-12 text-center text-sm font-sans text-slate-400">
                Loading published articles...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 space-y-3">
                <p>No articles found in this section.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-sans"
                >
                  Draft First Article →
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
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 sm:p-3 rounded-xl transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {art.section === 'standalone' ? 'general' : art.section}
                          </span>
                          {art.is_story_of_the_day && (
                            <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                              Story of the Day
                            </span>
                          )}
                          <span className="text-xs font-sans text-slate-400">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{art.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-sans">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {art.author_name}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {art.read_time_minutes} min
                          </span>
                          <span className="inline-flex items-center gap-1 truncate max-w-[260px]">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            /{art.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0 flex-wrap">
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStoryOfTheDay(art.id, Boolean(art.is_story_of_the_day))}
                              className={`px-3 py-2 sm:py-1.5 text-xs font-sans border rounded-lg transition-colors text-center ${art.is_story_of_the_day
                                  ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-900'
                                }`}
                            >
                              {art.is_story_of_the_day ? 'Unpin Lead' : 'Set as Lead'}
                            </button>
                            <button
                              type="button"
                              onClick={() => editArticle(art.id)}
                              className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 text-xs font-sans bg-white border border-slate-200 rounded-lg hover:border-black transition-colors text-center"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 text-xs font-sans text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-center"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-sans text-slate-400 italic">Read-only</span>
                        )}
                        <a
                          href={`https://theopenbrief.app/articles/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 sm:py-1.5 text-xs font-sans text-slate-600 border border-slate-200 sm:border-transparent rounded-lg hover:text-black shrink-0"
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

        {/* ── TAB 3: My Profile ── */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Your Author Profile</h2>
              <p className="text-xs text-slate-500 mt-1">
                Editable only by you. Your name and bio appear on all articles you publish.
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
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Editorial Role
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-sans uppercase font-bold rounded-lg bg-slate-900 text-white">
                    {profile?.role}
                  </span>
                  <span className="text-xs text-slate-400">
                    {profile?.role === 'admin'
                      ? 'Full system access'
                      : profile?.role === 'editor'
                        ? 'Edit/delete any article'
                        : 'Manage your own articles'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Author Photo / Avatar
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                  Display Name
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
                  Tag
                </label>
                <input
                  type="text"
                  value={profileBeat}
                  onChange={(e) => setProfileBeat(e.target.value)}
                  placeholder="e.g. Technology & Systems, Cinema & Culture, Lead Columnist"
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
                className="w-full sm:w-auto py-3 sm:py-2.5 px-6 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB 4: Staff & Password Access (Admin & Editor Only) ── */}
        {activeTab === 'staff' && isStaffManager && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Form: Grant Staff Access (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Grant Staff Access</h3>
                <p className="text-xs text-slate-500 mt-1">Create credentials for writers or reviewers.</p>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Full Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g., Clara Vance"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Login Username / Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g., cvance@theopenbrief.app"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Access Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Assign strong password"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Editorial Role &amp; Permissions
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white"
                  >
                    <option value="writer">Staff Writer (Draft &amp; Submit Only)</option>
                    <option value="editor">Editor (Review &amp; Edit All)</option>
                    <option value="admin">Admin (Full System Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Beat / Title
                  </label>
                  <input
                    type="text"
                    value={staffBeat}
                    onChange={(e) => setStaffBeat(e.target.value)}
                    placeholder="e.g., Senior Science Correspondent"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingStaff}
                  className="w-full py-3 sm:py-2.5 px-4 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-xs"
                >
                  {savingStaff ? 'Saving User Credentials...' : 'Save User Credentials'}
                </button>
              </form>
            </div>

            {/* Right Roster: Mobile Cards + Desktop Table (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Authorized Newsroom Roster</h3>
                <p className="text-xs text-slate-500 mt-1">Only listed accounts can authenticate into the editorial portal.</p>
              </div>

              {loadingStaff ? (
                <div className="py-12 text-center text-xs font-sans text-slate-400">
                  Loading newsroom roster...
                </div>
              ) : (
                <>
                  {/* Mobile Staff Cards (< md) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {staffList.map((m) => {
                      const isSelf = m.id === profile?.id
                      return (
                        <div key={m.id} className="py-3.5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-900 truncate">{m.name}</div>
                              <div className="text-xs text-slate-500 truncate">
                                {m.beat || (m.role === 'admin' ? 'Editor-in-Chief' : 'Staff Contributor')}
                              </div>
                            </div>
                            <span
                              className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold shrink-0 font-sans ${m.role === 'admin'
                                  ? 'bg-rose-100 text-rose-800'
                                  : m.role === 'editor'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {m.role}
                            </span>
                          </div>
                          <div className="text-[11px] font-sans text-slate-500 truncate">{m.email}</div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaffMember(m)
                                setEditPasswordValue('')
                                setEditRoleValue(m.role)
                              }}
                              className="flex-1 py-2 text-xs font-sans border border-slate-200 rounded-lg text-slate-700 hover:border-black"
                            >
                              Edit Role / Password
                            </button>
                            {isSelf ? (
                              <span className="px-3 py-2 text-[11px] font-sans text-slate-400 italic">(You)</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(m.id, m.name)}
                                className="px-3 py-2 text-xs font-sans text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop Staff Table (>= md) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-sans text-[10px] uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Staff Member</th>
                          <th className="pb-3 font-semibold">Username</th>
                          <th className="pb-3 font-semibold">Password</th>
                          <th className="pb-3 font-semibold">Role</th>
                          <th className="pb-3 font-semibold text-right">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffList.map((m) => {
                          const isSelf = m.id === profile?.id
                          return (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 pr-3">
                                <div className="font-bold text-slate-900">{m.name}</div>
                                <div className="text-[11px] text-slate-500 font-normal">
                                  {m.beat || (m.role === 'admin' ? 'Editor-in-Chief' : 'Staff Contributor')}
                                </div>
                              </td>
                              <td className="py-3.5 pr-3 font-sans text-slate-600 text-[11px]">
                                {m.email}
                              </td>
                              <td className="py-3.5 pr-3 font-sans text-slate-700">
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                                  Supabase Auth (Hashed)
                                </span>
                              </td>
                              <td className="py-3.5 pr-3">
                                <span
                                  className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold inline-block font-sans ${m.role === 'admin'
                                      ? 'bg-rose-100 text-rose-800'
                                      : m.role === 'editor'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                  {m.role}
                                </span>
                              </td>
                              <td className="py-3.5 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStaffMember(m)
                                    setEditPasswordValue('')
                                    setEditRoleValue(m.role)
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-black hover:bg-slate-100 rounded transition-colors inline-block"
                                  title="Edit Password / Role"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                  </svg>
                                </button>
                                {isSelf ? (
                                  <span className="text-[10px] font-sans text-slate-400 italic">(You)</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStaff(m.id, m.name)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors inline-block"
                                    title="Revoke Access"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                    </svg>
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal: Edit Staff Member's Password & Role */}
            {editingStaffMember && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-slate-900">Edit Staff Credentials</h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5 truncate">
                        {editingStaffMember.name} ({editingStaffMember.email})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingStaffMember(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSaveStaffEdit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Access Password
                      </label>
                      <input
                        type="text"
                        required
                        value={editPasswordValue}
                        onChange={(e) => setEditPasswordValue(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Updates the login password immediately.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Editorial Role
                      </label>
                      <select
                        value={editRoleValue}
                        onChange={(e) => setEditRoleValue(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                      >
                        <option value="writer">Staff Writer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingStaffMember(null)}
                        className="px-4 py-2 text-xs text-slate-600 hover:text-black border border-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updatingStaff}
                        className="px-4 py-2 text-xs bg-slate-900 text-white font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                      >
                        {updatingStaff ? 'Updating...' : 'Save New Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Sticky Mobile Publish Action Bar (Visible on < lg when in Writing Desk) ── */}
      {activeTab === 'editor' && (
        <div className="lg:hidden fixed bottom-[56px] inset-x-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3.5 py-2 flex items-center justify-between gap-2.5">
          <div className="text-[11px] font-sans text-slate-500 truncate">
            {editingId ? 'Editing live story' : 'Draft ready'}
          </div>
          <button
            type="button"
            onClick={publishArticle}
            disabled={publishing || !canEditCurrent}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-black transition-colors disabled:opacity-50 shrink-0"
          >
            {publishing ? 'Publishing...' : editingId ? 'Update Live' : 'Publish Live'}
          </button>
        </div>
      )}

      {/* ── Fixed Mobile Bottom Tab Bar (< sm) ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 h-[56px] flex items-stretch">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-sans ${activeTab === 'editor' ? 'text-slate-900 font-bold' : 'text-slate-400'
            }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          Write
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('archive'); fetchArchive() }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-sans ${activeTab === 'archive' ? 'text-slate-900 font-bold' : 'text-slate-400'
            }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          Articles ({articles.length})
        </button>

        {isStaffManager && (
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); fetchStaff() }}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-sans ${activeTab === 'staff' ? 'text-slate-900 font-bold' : 'text-slate-400'
              }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            Staff
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-sans ${activeTab === 'profile' ? 'text-slate-900 font-bold' : 'text-slate-400'
            }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          Profile
        </button>
      </nav>

      {/* ── Admin Footer (Hidden on mobile to keep bottom bar clean) ── */}
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-6 mt-16 text-xs font-sans text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} TheOpenBrief. Author Studio. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Developed by{' '}
              <a
                href="https://anandhukrishne.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-black transition-colors underline"
              >
                45 STUDioS
              </a>
            </span>
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

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="underline text-slate-900 font-medium">
          {linkMatch[1]}
        </a>
      )
    }
    return part
  })
}

function MarkdownViewer({ content }: { content: string }) {
  if (!content) return <p className="text-slate-400 italic">No content written yet...</p>

  return (
    <div className="space-y-4">
      {content.split('\n\n').map((block, idx) => {
        const text = block.trim()
        if (!text) return null
        if (text === '---') {
          return <hr key={idx} className="border-slate-200 my-6" />
        }
        if (text.startsWith('## ')) {
          return <h2 key={idx} className="font-bold text-xl text-slate-900 mt-4 tracking-tight">{text.replace('## ', '')}</h2>
        }
        if (text.startsWith('### ')) {
          return <h3 key={idx} className="font-bold text-lg text-slate-900 mt-3 tracking-tight">{text.replace('### ', '')}</h3>
        }
        if (text.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-slate-900 pl-4 text-slate-700 my-2 font-medium">
              {renderInlineFormatting(text.replace(/^>\s?/gm, ''))}
            </blockquote>
          )
        }
        if (text.startsWith('```')) {
          return (
            <pre key={idx} className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-sans overflow-x-auto">
              {text.replace(/^```[^\n]*\n?|\n?```$/g, '')}
            </pre>
          )
        }
        if (text.split('\n').every((line) => line.trim().startsWith('- '))) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 text-slate-700">
              {text.split('\n').map((line, li) => (
                <li key={li}>{renderInlineFormatting(line.trim().slice(2))}</li>
              ))}
            </ul>
          )
        }
        return <p key={idx} className="text-slate-700 leading-relaxed">{renderInlineFormatting(text)}</p>
      })}
    </div>
  )
}