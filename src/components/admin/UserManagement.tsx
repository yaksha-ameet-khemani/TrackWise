import { useState, useEffect, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/auth'

const INP =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Invite form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoadingUsers(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setUsers(data as Profile[])
    setLoadingUsers(false)
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    setInviting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim(), name: name.trim() }),
        },
      )

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Invite failed')

      setInviteSuccess(`Invite sent to ${email}. They will receive an email to set their password.`)
      setName('')
      setEmail('')
      fetchUsers()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-base font-semibold text-gray-900 mb-1">User Management</h2>
      <p className="text-sm text-gray-500 mb-6">
        Invite team members. They will receive an email with a link to set their password.
      </p>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Invite a new member</h3>
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Smith"
                className={INP}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@example.com"
                className={INP}
              />
            </div>
          </div>

          {inviteError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {inviteSuccess}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={inviting}
              className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {inviting ? 'Sending invite…' : 'Send invite'}
            </button>
          </div>
        </form>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            Members ({users.length})
          </h3>
        </div>

        {loadingUsers ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No members yet.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900 font-medium">{u.name || '—'}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
