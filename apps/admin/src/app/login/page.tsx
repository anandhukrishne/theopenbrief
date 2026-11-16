'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { clientAuth } from '@/lib/firebaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Sign in with Firebase Client
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // 2. Exchange ID token for secure HttpOnly session cookie
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to initialize session')
      }

      // 3. Redirect into studio dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F9FA]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <img src="/favicon.png" alt="The Open Brief" className="w-12 h-12 mx-auto rounded-lg object-contain shadow-sm mb-3" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Author Studio</h1>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">The Open Brief Newsroom</p>
        </div>

        {error && (
          <div className="p-3.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Author Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="editor@theopenbrief.app"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Secret Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Authenticating with Google...' : 'Enter Studio →'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Adoor / Global</span>
          <span>Spark Plan Auth</span>
        </div>
      </div>
    </div>
  )
}
