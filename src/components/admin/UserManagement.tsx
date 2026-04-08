import { useState, useEffect, Fragment, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/auth'

const INP =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatDateTime(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Invite form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  // Resend state per user
  const [resending, setResending] = useState<string | null>(null)
  const [resendMsg, setResendMsg] = useState<Record<string, string>>({})

  // Revoke / restore state
  const [managing, setManaging] = useState<string | null>(null)
  const [manageMsg, setManageMsg] = useState<Record<string, string>>({})

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoadingUsers(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('invited_at', { ascending: false, nullsFirst: false })
    if (!error && data) setUsers(data as Profile[])
    setLoadingUsers(false)
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    setInviting(true)

    try {
      const { data: json, error: fnError } = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), name: name.trim() },
      })

      if (fnError) throw new Error(fnError.message)
      if (json?.error) throw new Error(json.error)

      setInviteSuccess(`Invite sent to ${email}. They have 24 hours to accept it.`)
      setName('')
      setEmail('')
      fetchUsers()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  async function handleResend(user: Profile) {
    setResending(user.id)
    setResendMsg({})
    try {
      const { data: json, error: fnError } = await supabase.functions.invoke('invite-user', {
        body: { email: user.email, name: user.name },
      })

      if (fnError) throw new Error(fnError.message)
      if (json?.error) throw new Error(json.error)

      setResendMsg({ [user.id]: `Invite resent to ${user.email}` })
      fetchUsers()
    } catch (err) {
      setResendMsg({ [user.id]: err instanceof Error ? err.message : 'Failed' })
    } finally {
      setResending(null)
    }
  }

  async function handleManage(user: Profile, action: 'revoke' | 'restore') {
    setManaging(user.id)
    setManageMsg({})
    try {
      const { data: json, error: fnError } = await supabase.functions.invoke('manage-user', {
        body: { userId: user.id, action },
      })
      if (fnError) throw new Error(fnError.message)
      if (json?.error) throw new Error(json.error)
      setManageMsg({
        [user.id]: action === 'revoke'
          ? `${user.name || user.email} has been revoked.`
          : `${user.name || user.email} has been restored.`,
      })
      fetchUsers()
    } catch (err) {
      setManageMsg({ [user.id]: err instanceof Error ? err.message : 'Failed' })
    } finally {
      setManaging(null)
    }
  }

  const activeCount = users.filter((u) => u.status === 'active' && !u.is_revoked).length
  const pendingCount = users.filter((u) => u.status === 'pending' && !u.is_revoked).length
  const revokedCount = users.filter((u) => u.is_revoked).length

  return (
    <div className="max-w-4xl">
      <h2 className="text-base font-semibold text-gray-900 mb-1">User Management</h2>
      <p className="text-sm text-gray-500 mb-6">
        Invite team members. They will receive an email with a link valid for 24 hours.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total members</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending invite</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <p className="text-2xl font-bold text-red-600">{revokedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Revoked</p>
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Invite a new member</h3>
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Email address</label>
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

      {/* Members table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">All members</h3>
          <button
            onClick={fetchUsers}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loadingUsers ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">No members yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 whitespace-nowrap">Invited on</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 whitespace-nowrap">Last sign in</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <tr
                    className={`border-b border-gray-50 last:border-0 ${
                      u.is_revoked ? 'bg-red-50 opacity-70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                      {u.name || '—'}
                    </td>
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
                    <td className="px-6 py-3">
                      {u.is_revoked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Revoked
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            u.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              u.status === 'active' ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                          />
                          {u.status === 'active' ? 'Active' : 'Pending invite'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">
                      {formatDate(u.invited_at)}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">
                      {u.is_revoked && u.revoked_at
                        ? `Revoked ${formatDate(u.revoked_at)}`
                        : formatDateTime(u.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!u.is_revoked && u.status === 'pending' && (
                          <button
                            onClick={() => handleResend(u)}
                            disabled={resending === u.id}
                            className="px-3 py-1 text-xs border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors"
                          >
                            {resending === u.id ? 'Resending…' : 'Resend invite'}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          u.is_revoked ? (
                            <button
                              onClick={() => handleManage(u, 'restore')}
                              disabled={managing === u.id}
                              className="px-3 py-1 text-xs border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                            >
                              {managing === u.id ? 'Restoring…' : 'Restore'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Revoke access for ${u.name || u.email}? They will be immediately signed out.`))
                                  handleManage(u, 'revoke')
                              }}
                              disabled={managing === u.id}
                              className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              {managing === u.id ? 'Revoking…' : 'Revoke'}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                  {(resendMsg[u.id] || manageMsg[u.id]) && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-2 text-xs text-gray-500 italic">
                        {resendMsg[u.id] || manageMsg[u.id]}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  )
}
