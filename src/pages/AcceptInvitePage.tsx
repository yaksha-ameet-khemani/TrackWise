import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

type PageState = 'form' | 'expired' | 'success'

export default function AcceptInvitePage() {
  const { user, clearPasswordSetup } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageState, setPageState] = useState<PageState>('form')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        // Detect expired / invalid invite token
        const msg = updateError.message.toLowerCase()
        if (
          msg.includes('expired') ||
          msg.includes('invalid') ||
          msg.includes('token')
        ) {
          setPageState('expired')
          return
        }
        throw updateError
      }
      setPageState('success')
      setTimeout(() => clearPasswordSetup(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  // ── Expired link ────────────────────────────────────────────────────────────
  if (pageState === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Invite link expired</h1>
          <p className="text-sm text-gray-500 mb-6">
            Invite links are valid for <span className="font-medium">24 hours</span>.
            This one has expired.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
            <p className="text-sm font-medium text-amber-800 mb-1">What to do</p>
            <p className="text-sm text-amber-700">
              Contact your admin and ask them to resend the invite to{' '}
              <span className="font-medium">{user?.email}</span>.
              A fresh link will be sent to your email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Account activated!</h1>
          <p className="text-sm text-gray-500">Redirecting you to the app…</p>
        </div>
      </div>
    )
  }

  // ── Set password form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Welcome!</h1>
          <p className="text-sm text-gray-500 mt-1">
            You have been invited to the Content Sharing Portal.
            <br />
            Please set a password to activate your account.
          </p>
          {user?.email && (
            <p className="text-xs text-gray-400 mt-2 font-medium">{user.email}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? 'Activating account…' : 'Set password & continue'}
            </button>
          </form>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-1">Keep in mind</p>
          <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
            <li>Invite links expire after <span className="font-medium">24 hours</span></li>
            <li>Password must be at least 8 characters</li>
            <li>Contact your admin if you need a new invite</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
