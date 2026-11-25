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
  section: 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'editions'
  status: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  cover_image_caption?: string
  author_id?: string
  author_name: string
  author_bio?: string
  author_avatar_url?: string
  edition_id?: string
  edition_slug?: string
  read_time_minutes: number
  published_at: string
}

interface EditionItem {
  id: string
  title: string
  slug: string
  subtitle?: string
  description?: string
  editor_note?: string
  cover_image_url?: string
  theme_preset: 'christmas' | 'republic' | 'heritage' | 'monsoon' | 'midnight' | 'classic'
  accent_color?: string
  badge_text?: string
  status: 'draft' | 'published'
  article_ids?: string[]
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
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Current View
  const [activeTab, setActiveTab] = useState<'editor' | 'archive' | 'editions' | 'profile' | 'staff'>('editor')
  const [editorMode, setEditorMode] = useState<'edit' | 'split' | 'preview'>('edit')
  const [mobileCoverOpen, setMobileCoverOpen] = useState(true)
  const [mobileMetaOpen, setMobileMetaOpen] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [section, setSection] = useState<'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'editions'>('journal')
  const [articleEditionSlug, setArticleEditionSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageCaption, setCoverImageCaption] = useState('')
  const [readTime, setReadTime] = useState(5)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null)

  // Special Editions State
  const [editionsList, setEditionsList] = useState<EditionItem[]>([])
  const [loadingEditions, setLoadingEditions] = useState(false)
  const [editingEditionModal, setEditingEditionModal] = useState(false)
  const [editionId, setEditionId] = useState<string | null>(null)
  const [editionTitle, setEditionTitle] = useState('')
  const [editionSlug, setEditionSlug] = useState('')
  const [editionSubtitle, setEditionSubtitle] = useState('')
  const [editionDescription, setEditionDescription] = useState('')
  const [editionEditorNote, setEditionEditorNote] = useState('')
  const [editionCoverImageUrl, setEditionCoverImageUrl] = useState('')
  const [editionThemePreset, setEditionThemePreset] = useState<'christmas' | 'republic' | 'heritage' | 'monsoon' | 'midnight' | 'classic'>('christmas')
  const [editionAccentColor, setEditionAccentColor] = useState('#B91C1C')
  const [editionBadgeText, setEditionBadgeText] = useState('SPECIAL EDITION')
  const [editionStatus, setEditionStatus] = useState<'draft' | 'published'>('published')
  const [editionArticleIds, setEditionArticleIds] = useState<string[]>([])
  const [savingEdition, setSavingEdition] = useState(false)

  // Status & Notifications
  const [publishing, setPublishing] = useState(false)
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
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'journal' | 'explainers' | 'tech' | 'cinebrief' | 'standalone' | 'editions'>('all')

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
          setProfileAvatarUrl(data.profile.avatar_url || '')
          try {
            localStorage.setItem('openbrief_cached_profile', JSON.stringify(data.profile))
          } catch {}
        }
      } else if (res.status === 401) {
        try {
          localStorage.removeItem('openbrief_cached_profile')
        } catch {}
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
          setProfileAvatarUrl(parsed.avatar_url || '')
        }
      }
    } catch {}

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

  // Load special editions
  const fetchEditionsList = async () => {
    setLoadingEditions(true)
    try {
      const res = await fetch('/api/editions')
      if (res.ok) {
        const data = await res.json()
        setEditionsList(data.editions || [])
      }
    } catch (err) {
      console.error('Failed to load editions:', err)
    } finally {
      setLoadingEditions(false)
    }
  }

  useEffect(() => {
    fetchEditionsList()
  }, [])

  useEffect(() => {
    if (activeTab === 'staff') {
      fetchStaff()
    } else if (activeTab === 'editions') {
      fetchEditionsList()
      fetchArchive()
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
    } catch {}
    try { await supabaseClient.auth.signOut() } catch (_) {}
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setArticleEditionSlug('')
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
      setArticleEditionSlug(art.edition_slug || '')
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
          edition_slug: articleEditionSlug || '',
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
      fetchEditionsList()
    } catch (err: any) {
      setMessage({ type: 'error', text: `Publication error: ${err.message}` })
    } finally {
      setPublishing(false)
    }
  }

  // Edition Management Handlers
  const openCreateEdition = () => {
    setEditionId(null)
    setEditionTitle('')
    setEditionSlug('')
    setEditionSubtitle('')
    setEditionDescription('')
    setEditionEditorNote('')
    setEditionCoverImageUrl('')
    setEditionThemePreset('christmas')
    setEditionAccentColor('#B91C1C')
    setEditionBadgeText('CHRISTMAS 2026')
    setEditionStatus('published')
    setEditionArticleIds([])
    setEditingEditionModal(true)
  }

  const openEditEdition = (ed: EditionItem) => {
    setEditionId(ed.id)
    setEditionTitle(ed.title)
    setEditionSlug(ed.slug)
    setEditionSubtitle(ed.subtitle || '')
    setEditionDescription(ed.description || '')
    setEditionEditorNote(ed.editor_note || '')
    setEditionCoverImageUrl(ed.cover_image_url || '')
    setEditionThemePreset(ed.theme_preset || 'christmas')
    setEditionAccentColor(ed.accent_color || '#B91C1C')
    setEditionBadgeText(ed.badge_text || 'SPECIAL EDITION')
    setEditionStatus(ed.status || 'published')
    const ids = Array.isArray(ed.article_ids) ? ed.article_ids : []
    setEditionArticleIds(ids)
    setEditingEditionModal(true)
  }

  const handleSaveEdition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editionTitle.trim() || !editionSlug.trim()) {
      alert('Please provide an edition title and slug.')
      return
    }

    setSavingEdition(true)
    setMessage(null)

    try {
      const method = editionId ? 'PUT' : 'POST'
      const payload: any = {
        title: editionTitle.trim(),
        slug: editionSlug.trim(),
        subtitle: editionSubtitle.trim(),
        description: editionDescription.trim(),
        editor_note: editionEditorNote.trim(),
        cover_image_url: editionCoverImageUrl.trim(),
        theme_preset: editionThemePreset,
        accent_color: editionAccentColor,
        badge_text: editionBadgeText.trim(),
        status: editionStatus,
        article_ids: editionArticleIds,
      }
      if (editionId) payload.id = editionId

      const res = await fetch('/api/editions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save edition')
      }

      setMessage({
        type: 'success',
        text: `Special Edition "${editionTitle}" saved live!`,
        link: `https://theopenbrief.app/editions/${editionSlug}`,
      })
      setEditingEditionModal(false)
      fetchEditionsList()
    } catch (err: any) {
      alert(`Error saving edition: ${err.message}`)
    } finally {
      setSavingEdition(false)
    }
  }

  const handleDeleteEdition = async (id: string, edTitle: string) => {
    if (!window.confirm(`Permanently delete special edition "${edTitle}"? This will not delete the articles.`)) {
      return
    }

    try {
      const res = await fetch(`/api/editions?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete edition')
      }
      setMessage({ type: 'success', text: `Edition "${edTitle}" deleted.` })
      fetchEditionsList()
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
          <div className="flex items-center gap-2 shrink-0">
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

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium ml-3">
            <button
              type="button"
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
              type="button"
              onClick={() => { setActiveTab('archive'); fetchArchive() }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'archive' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Articles ({articles.length})
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('editions'); fetchEditionsList(); fetchArchive() }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'editions' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              Special Editions ({editionsList.length})
            </button>
            {isStaffManager && (
              <button
                type="button"
                onClick={() => { setActiveTab('staff'); fetchStaff() }}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-black'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
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
              className="sm:hidden px-2.5 py-1.5 text-[11px] font-mono bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
            >
              + New
            </button>
          )}

          <a
            href="https://theopenbrief.app"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-slate-500 hover:text-black transition-colors hidden md:inline"
          >
            Live Site ↗
          </a>

          {/* User Badge with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-2 sm:px-2.5 py-1.5 rounded-lg hover:border-slate-400 transition-colors cursor-pointer select-none min-h-[36px]"
            >
              <span className="font-semibold text-slate-800 max-w-[92px] sm:max-w-[140px] truncate">
                {profile?.name || 'Author'}
              </span>
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
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-sans">
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
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    Staff &amp; Password Access
                  </button>
                )}

                <a
                  href="https://theopenbrief.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
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
                  className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors font-medium"
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
      <div className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
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
                className="font-mono text-xs underline font-semibold text-emerald-800 hover:text-emerald-950 shrink-0"
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
                  <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                    Section
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 sm:hidden">
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
                      id: 'editions',
                      label: 'Special Edition',
                      desc: 'Holiday & Event Issues',
                      icon: (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
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
                      className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all shrink-0 min-w-[132px] sm:min-w-0 snap-start ${
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

              {/* Special Edition Assignment Selector */}
              {editionsList.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      Curate into Special Edition:
                    </span>
                  </div>
                  <select
                    value={articleEditionSlug}
                    onChange={(e) => {
                      const val = e.target.value
                      setArticleEditionSlug(val)
                      if (val) setSection('editions')
                    }}
                    className="text-xs font-mono font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">None (Standard Standalone / Desk Section)</option>
                    {editionsList.map((ed) => (
                      <option key={ed.id} value={ed.slug}>
                        {ed.title} ({ed.theme_preset.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Author Attribution Card */}
              <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600">
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
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-mono rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Code Block"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n\n---\n\n')}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-mono rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 shrink-0"
                    title="Divider"
                  >
                    —
                  </button>
                  <button
                    type="button"
                    onClick={insertLink}
                    className="px-2.5 py-1.5 sm:px-2 sm:py-1 font-mono rounded-md bg-slate-50 sm:bg-transparent hover:bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0"
                    title="Insert Link"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                    Link
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-mono ml-auto">
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
                    className="w-full text-sm font-mono text-slate-800 border border-slate-200 rounded-lg p-3 resize-none outline-none focus:ring-1 focus:ring-slate-900"
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
                      className="w-full py-2 text-xs font-mono text-slate-600 hover:text-black border border-slate-200 rounded-lg transition-colors"
                    >
                      Clear &amp; Start New Blank Draft
                    </button>

                    {canEditCurrent && (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => handleDeleteArticle(editingId, title)}
                        className="w-full py-2 text-xs font-mono text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
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
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                    Cover Image {coverImageUrl ? '• Attached' : ''}
                  </span>
                  <span className="text-xs font-mono text-slate-400 lg:hidden">
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
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                    Metadata &amp; URL Slug
                  </span>
                  <span className="text-xs font-mono text-slate-400 lg:hidden">
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
                )}
              </div>

              {/* Mobile Delete Action when editing an existing post */}
              {editingId && canEditCurrent && (
                <div className="lg:hidden">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => handleDeleteArticle(editingId, title)}
                    className="w-full py-2.5 text-xs font-mono text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
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

              {/* Filter Strip */}
              <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto pb-1">
                {(['all', 'journal', 'explainers', 'tech', 'cinebrief', 'standalone', 'editions'] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setArchiveFilter(sec)}
                    className={`px-3 py-1.5 rounded-lg border capitalize shrink-0 ${
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
                Loading published articles...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 space-y-3">
                <p>No articles found in this section.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-mono"
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {art.section}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {new Date(art.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{art.title}</h3>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          by {art.author_name} • {art.read_time_minutes} min • /{art.slug}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              onClick={() => editArticle(art.id)}
                              className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg hover:border-black transition-colors text-center"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 text-xs font-mono text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-center"
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
                          className="px-3 py-2 sm:py-1.5 text-xs font-mono text-slate-600 border border-slate-200 sm:border-transparent rounded-lg hover:text-black shrink-0"
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
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Editorial Role
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-mono uppercase font-bold rounded-lg bg-slate-900 text-white">
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
                  Author Photo / Avatar (Compressed WebP)
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Login Username / Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g., cvance@theopenbrief.app"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Access Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Assign strong password"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
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
                <div className="py-12 text-center text-xs font-mono text-slate-400">
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
                              className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold shrink-0 font-mono ${
                                m.role === 'admin'
                                  ? 'bg-rose-100 text-rose-800'
                                  : m.role === 'editor'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {m.role}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 truncate">{m.email}</div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaffMember(m)
                                setEditPasswordValue('')
                                setEditRoleValue(m.role)
                              }}
                              className="flex-1 py-2 text-xs font-mono border border-slate-200 rounded-lg text-slate-700 hover:border-black"
                            >
                              Edit Role / Password
                            </button>
                            {isSelf ? (
                              <span className="px-3 py-2 text-[11px] font-mono text-slate-400 italic">(You)</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(m.id, m.name)}
                                className="px-3 py-2 text-xs font-mono text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50"
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
                        <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
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
                              <td className="py-3.5 pr-3 font-mono text-slate-600 text-[11px]">
                                {m.email}
                              </td>
                              <td className="py-3.5 pr-3 font-mono text-slate-700">
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                                  Supabase Auth (Hashed)
                                </span>
                              </td>
                              <td className="py-3.5 pr-3">
                                <span
                                  className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold inline-block font-mono ${
                                    m.role === 'admin'
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
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                  </svg>
                                </button>
                                {isSelf ? (
                                  <span className="text-[10px] font-mono text-slate-400 italic">(You)</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStaff(m.id, m.name)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors inline-block"
                                    title="Revoke Access"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
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
                      <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                        {editingStaffMember.name} ({editingStaffMember.email})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingStaffMember(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
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
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
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

        {/* ── TAB 5: Special Editions Management ── */}
        {activeTab === 'editions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 font-bold block mb-1">
                  Commemorative Issues &amp; Special Collections
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Special Editions Manager
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Design festive, milestone, and seasonal editions (such as Christmas or Republic Day) with customized theme palettes, heraldic badges, and curated story lineups.
                </p>
              </div>

              {isStaffManager && (
                <button
                  type="button"
                  onClick={openCreateEdition}
                  className="px-4 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  New Special Edition
                </button>
              )}
            </div>

            {loadingEditions ? (
              <div className="py-16 text-center text-sm font-mono text-slate-400">
                Loading special editions...
              </div>
            ) : editionsList.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-4 max-w-xl mx-auto my-8">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  No Editions Created
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  Ready to launch a Christmas or Republic Day Special?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create your first specially designed edition page to curate companion dispatches and feature commemorative broadsheet heraldry.
                </p>
                {isStaffManager && (
                  <button
                    type="button"
                    onClick={openCreateEdition}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-mono font-bold rounded-lg hover:bg-black transition-colors"
                  >
                    Create First Edition →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {editionsList.map((ed) => {
                  const curatedCount = Array.isArray(ed.article_ids) ? ed.article_ids.length : 0
                  return (
                    <div
                      key={ed.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Theme Accent Bar */}
                        <div
                          className="h-2 w-full"
                          style={{ backgroundColor: ed.accent_color || '#B91C1C' }}
                        />

                        {ed.cover_image_url && (
                          <div className="w-full h-32 overflow-hidden bg-slate-100 border-b border-slate-100">
                            <img
                              src={ed.cover_image_url}
                              alt={ed.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest font-extrabold rounded text-white"
                              style={{ backgroundColor: ed.accent_color || '#B91C1C' }}
                            >
                              {ed.badge_text || ed.theme_preset.toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded ${
                                ed.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {ed.status}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-snug">
                              {ed.title}
                            </h3>
                            {ed.subtitle && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {ed.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 space-y-0.5 pt-1">
                            <div>Theme: <span className="capitalize font-semibold text-slate-700">{ed.theme_preset}</span></div>
                            <div>Curated stories: <span className="font-semibold text-slate-700">{curatedCount}</span></div>
                            <div>Slug: <span className="text-slate-600">/editions/{ed.slug}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                        {isStaffManager ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditEdition(ed)}
                              className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg hover:border-black transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEdition(ed.id, ed.title)}
                              className="px-3 py-1.5 text-xs font-mono text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">View Only</span>
                        )}

                        <a
                          href={`https://theopenbrief.app/editions/${ed.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-mono text-slate-600 border border-slate-200 rounded-lg hover:text-black hover:border-slate-400 transition-colors"
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

      {/* ── Special Edition Editor Modal ── */}
      {editingEditionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {editionId ? 'Edit Special Edition' : 'Create Special Edition'}
                </h3>
                <p className="text-xs text-slate-500">
                  Design and curate bespoke issues like Christmas or Republic Day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEditionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-sm font-bold"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveEdition} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Theme Preset Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-2">
                  Theme Preset &amp; Aesthetic
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'christmas', label: 'Christmas', color: '#B91C1C', desc: 'Festive Crimson & Pine' },
                    { id: 'republic', label: 'Republic Day', color: '#1D4ED8', desc: 'Sovereign Navy & Tricolor' },
                    { id: 'heritage', label: 'Heritage', color: '#92400E', desc: 'Antique Gold & Bronze' },
                    { id: 'monsoon', label: 'Monsoon', color: '#0F766E', desc: 'Literary Teal & Slate' },
                    { id: 'midnight', label: 'Midnight Tech', color: '#06B6D4', desc: 'Obsidian & Neon Cyan' },
                    { id: 'classic', label: 'Classic Broadsheet', color: '#171717', desc: 'Charcoal & Red' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setEditionThemePreset(t.id as any)
                        setEditionAccentColor(t.color)
                        if (!editionBadgeText || editionBadgeText === 'SPECIAL EDITION' || editionBadgeText.includes('2026') || editionBadgeText.includes('SPECIAL')) {
                          if (t.id === 'christmas') setEditionBadgeText('CHRISTMAS 2026')
                          else if (t.id === 'republic') setEditionBadgeText('REPUBLIC SPECIAL')
                          else if (t.id === 'heritage') setEditionBadgeText('HERITAGE ISSUE')
                          else if (t.id === 'monsoon') setEditionBadgeText('MONSOON JOURNAL')
                          else if (t.id === 'midnight') setEditionBadgeText('TECH SPECIAL')
                          else setEditionBadgeText('SPECIAL EDITION')
                        }
                      }}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        editionThemePreset === t.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="font-bold text-xs truncate">{t.label}</span>
                      </div>
                      <span className={`text-[10px] block truncate ${editionThemePreset === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editionTitle}
                    onChange={(e) => {
                      const v = e.target.value
                      setEditionTitle(v)
                      if (!editionId && (!editionSlug || editionSlug === editionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
                        setEditionSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                      }
                    }}
                    placeholder="e.g. Christmas Edition 2026"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editionSlug}
                    onChange={(e) => setEditionSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}
                    placeholder="e.g. christmas-2026"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                    URL: theopenbrief.app/editions/{editionSlug || '...'}
                  </span>
                </div>
              </div>

              {/* Badge & Accent Color & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={editionBadgeText}
                    onChange={(e) => setEditionBadgeText(e.target.value)}
                    placeholder="e.g. CHRISTMAS 2026"
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editionAccentColor}
                      onChange={(e) => setEditionAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={editionAccentColor}
                      onChange={(e) => setEditionAccentColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                    Status
                  </label>
                  <select
                    value={editionStatus}
                    onChange={(e) => setEditionStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Staff Only)</option>
                  </select>
                </div>
              </div>

              {/* Subtitle / Tagline */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                  Subtitle / Issue Tagline
                </label>
                <input
                  type="text"
                  value={editionSubtitle}
                  onChange={(e) => setEditionSubtitle(e.target.value)}
                  placeholder="e.g. Dispatches on winter tradition, civic memory, and new horizons."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Cover Artwork URL + WebP Uploader */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold">
                  Edition Banner / Cover Artwork URL
                </label>
                <input
                  type="text"
                  value={editionCoverImageUrl}
                  onChange={(e) => setEditionCoverImageUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/.../edition-cover.webp"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <WebPUploader
                  onUploadComplete={(url) => setEditionCoverImageUrl(url)}
                />
              </div>

              {/* Letter from Editor / Issue Prologue */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                  Letter from the Editor / Prologue (Markdown Supported)
                </label>
                <textarea
                  rows={4}
                  value={editionEditorNote}
                  onChange={(e) => setEditionEditorNote(e.target.value)}
                  placeholder="Write an introductory message or lead note from the editorial desk introducing this commemorative issue..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed font-serif"
                />
              </div>

              {/* Curate Articles Checklist */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold mb-1">
                  Curate Articles for this Issue ({editionArticleIds.length} Selected)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Check all articles that should be featured in this commemorative edition. The first selected article serves as the Lead Dispatch.
                </p>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto p-1 bg-slate-50/50">
                  {articles.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No articles in archive to select from.
                    </div>
                  ) : (
                    articles.map((art) => {
                      const isSelected = editionArticleIds.includes(art.id)
                      return (
                        <label
                          key={art.id}
                          className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer rounded-lg hover:bg-white transition-colors ${
                            isSelected ? 'bg-white font-semibold text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditionArticleIds([...editionArticleIds, art.id])
                                } else {
                                  setEditionArticleIds(editionArticleIds.filter((id) => id !== art.id))
                                }
                              }}
                              className="rounded border-slate-300 text-slate-900 focus:ring-0 w-4 h-4"
                            />
                            <span className="truncate">{art.title}</span>
                          </div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 shrink-0">
                            {art.section}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingEditionModal(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-600 hover:text-black border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdition}
                  className="px-5 py-2 text-xs font-mono bg-slate-900 text-white font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                >
                  {savingEdition ? 'Saving Edition...' : editionId ? 'Update Edition' : 'Publish Edition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* ── Sticky Mobile Publish Action Bar (Visible on < lg when in Writing Desk) ── */}
      {activeTab === 'editor' && (
        <div className="lg:hidden fixed bottom-[56px] inset-x-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3.5 py-2 flex items-center justify-between gap-2.5">
          <div className="text-[11px] font-mono text-slate-500 truncate">
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
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-mono ${
            activeTab === 'editor' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Write
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('archive'); fetchArchive() }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-mono ${
            activeTab === 'archive' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Articles ({articles.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('editions'); fetchEditionsList(); fetchArchive() }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-mono ${
            activeTab === 'editions' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          Editions
        </button>

        {isStaffManager && (
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); fetchStaff() }}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-mono ${
              activeTab === 'staff' ? 'text-slate-900 font-bold' : 'text-slate-400'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            Staff
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-mono ${
            activeTab === 'profile' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Profile
        </button>
      </nav>

      {/* ── Admin Footer (Hidden on mobile to keep bottom bar clean) ── */}
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-6 mt-16 text-xs font-mono text-slate-500">
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
            <pre key={idx} className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
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