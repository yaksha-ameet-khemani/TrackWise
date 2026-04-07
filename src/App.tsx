import { useState, useCallback, useEffect } from 'react';
import { Entry, Tab, Filters } from './types';
import { fetchEntries, upsertEntries, deleteEntry } from './utils/db';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import UpdatedDashboard from './components/UpdatedDashboard';
import EntryForm from './components/EntryForm';
import AllEntries from './components/AllEntries';

const DEFAULT_FILTERS: Filters = {
  client: '',
  skill: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  showReplaced: 'active',
};

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Load all entries from Supabase on mount
  useEffect(() => {
    fetchEntries()
      .then(setEntries)
      .catch((err) => setLoadError(err.message ?? 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(
    async (data: Omit<Entry, 'id'>, id?: string) => {
      let updated = [...entries];
      const finalId = id ?? crypto.randomUUID();
      const toUpsert: Entry[] = [];

      if (id) {
        // Editing existing entry
        const old = updated.find((e) => e.id === id);

        // If the "replaces" target changed, restore the old original
        if (old?.replacesId && old.replacesId !== data.replacesId) {
          updated = updated.map((e) =>
            e.id === old.replacesId
              ? { ...e, isReplaced: false, replacedById: '', replacementReason: '' }
              : e,
          );
          const restored = updated.find((e) => e.id === old.replacesId);
          if (restored) toUpsert.push(restored);
        }

        updated = updated.map((e) => (e.id === id ? { ...e, ...data, id } : e));
      } else {
        // New entry
        updated.push({ ...data, id: finalId });
      }

      const saved = updated.find((e) => e.id === finalId) ?? ({ ...data, id: finalId } as Entry);
      toUpsert.push(saved);

      // Link to original if this is a replacement
      if (data.replacesId) {
        updated = updated.map((e) =>
          e.id === data.replacesId
            ? { ...e, isReplaced: true, replacedById: finalId, replacementReason: data.replacementReason }
            : e,
        );
        const replacedOriginal = updated.find((e) => e.id === data.replacesId);
        if (replacedOriginal) toUpsert.push(replacedOriginal);
      }

      // Optimistic update — apply to UI immediately
      setEntries(updated);
      setEditingId(null);
      setReplacingId(null);
      setActiveTab('entries');
      setFilters((prev) => ({ ...prev, showReplaced: 'all' }));

      // Persist to Supabase — revert on failure
      try {
        await upsertEntries(toUpsert);
      } catch (err) {
        console.error('Save failed:', err);
        alert('Save failed — changes reverted. Please try again.');
        setEntries(entries);
      }
    },
    [entries],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !confirm(
          'Delete this entry? If it was a replacement, the original will be restored as active.',
        )
      )
        return;

      let updated = [...entries];
      const e = updated.find((x) => x.id === id);
      const toUpsert: Entry[] = [];

      // Restore original if deleting a replacement
      if (e?.replacesId) {
        updated = updated.map((x) =>
          x.id === e.replacesId
            ? { ...x, isReplaced: false, replacedById: '', replacementReason: '' }
            : x,
        );
        const restored = updated.find((x) => x.id === e.replacesId);
        if (restored) toUpsert.push(restored);
      }

      // Clear the replacedById pointer if deleting an original
      if (e?.isReplaced && e.replacedById) {
        updated = updated.map((x) =>
          x.id === e.replacedById ? { ...x, replacesId: '' } : x,
        );
        const cleared = updated.find((x) => x.id === e.replacedById);
        if (cleared) toUpsert.push(cleared);
      }

      // Optimistic update
      setEntries(updated.filter((x) => x.id !== id));

      // Persist
      try {
        await Promise.all([deleteEntry(id), upsertEntries(toUpsert)]);
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Delete failed — changes reverted. Please try again.');
        setEntries(entries);
      }
    },
    [entries],
  );

  const handleEdit = useCallback((id: string) => {
    setReplacingId(null);
    setEditingId(id);
    setActiveTab('add');
  }, []);

  const handleReplace = useCallback((id: string) => {
    setEditingId(null);
    setReplacingId(id);
    setActiveTab('add');
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    if (tab !== 'add') {
      setEditingId(null);
      setReplacingId(null);
    }
    setActiveTab(tab);
  }, []);

  const editingEntry = editingId ? entries.find((e) => e.id === editingId) : undefined;
  const replacingEntry = replacingId ? entries.find((e) => e.id === replacingId) : undefined;

  // ── loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading entries…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-red-600 mb-1">Failed to load data</p>
          <p className="text-xs text-gray-500 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Content Sharing Portal</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Track daily assessment &amp; question sharing activity
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{entries.filter((e) => !e.isReplaced).length} active entries</span>
            <span>·</span>
            <span>{new Set(entries.map((e) => e.client)).size} clients</span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6">
        <Nav activeTab={activeTab} onTabChange={handleTabChange} entryCount={entries.length} />

        <div className="py-6">
          {activeTab === 'dashboard' && <Dashboard entries={entries} onEdit={handleEdit} />}
          {activeTab === 'updated-dashboard' && <UpdatedDashboard entries={entries} />}
          {activeTab === 'add' && (
            <EntryForm
              entries={entries}
              editingEntry={editingEntry}
              replacingEntry={replacingEntry}
              onSave={handleSave}
              onCancel={() => {
                setEditingId(null);
                setReplacingId(null);
                setActiveTab('entries');
              }}
            />
          )}
          {activeTab === 'entries' && (
            <AllEntries
              entries={entries}
              filters={filters}
              onFiltersChange={setFilters}
              onEdit={handleEdit}
              onReplace={handleReplace}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
