import { useState, useCallback } from 'react';
import { Entry, Tab, Filters } from './types';
import { loadEntries, saveEntries } from './utils/storage';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
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
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const updateEntries = useCallback((updated: Entry[]) => {
    setEntries(updated);
    saveEntries(updated);
  }, []);

  const handleSave = useCallback(
    (data: Omit<Entry, 'id'>, id?: string) => {
      let updated = [...entries];
      const finalId = id ?? crypto.randomUUID();

      if (id) {
        // Editing existing entry
        const old = updated.find((e) => e.id === id);

        // If the "replaces" target changed, restore the old original
        if (old?.replacesId && old.replacesId !== data.replacesId) {
          updated = updated.map((e) =>
            e.id === old.replacesId
              ? { ...e, isReplaced: false, replacedById: '', replacementReason: '' }
              : e
          );
        }

        updated = updated.map((e) => (e.id === id ? { ...e, ...data, id } : e));
      } else {
        // New entry
        updated.push({ ...data, id: finalId });
      }

      // Link to original if this is a replacement
      if (data.replacesId) {
        updated = updated.map((e) =>
          e.id === data.replacesId
            ? {
                ...e,
                isReplaced: true,
                replacedById: finalId,
                replacementReason: data.replacementReason,
              }
            : e
        );
      }

      updateEntries(updated);
      setEditingId(null);
      setActiveTab('entries');
      setFilters((prev) => ({ ...prev, showReplaced: 'all' }));
    },
    [entries, updateEntries]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm('Delete this entry? If it was a replacement, the original will be restored as active.'))
        return;

      let updated = [...entries];
      const e = updated.find((x) => x.id === id);

      // Restore original if deleting a replacement
      if (e?.replacesId) {
        updated = updated.map((x) =>
          x.id === e.replacesId
            ? { ...x, isReplaced: false, replacedById: '', replacementReason: '' }
            : x
        );
      }

      // Clear the replacedById pointer if deleting an original
      if (e?.isReplaced && e.replacedById) {
        updated = updated.map((x) =>
          x.id === e.replacedById ? { ...x, replacesId: '' } : x
        );
      }

      updateEntries(updated.filter((x) => x.id !== id));
    },
    [entries, updateEntries]
  );

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setActiveTab('add');
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    if (tab !== 'add') setEditingId(null);
    setActiveTab(tab);
  }, []);

  const editingEntry = editingId
    ? entries.find((e) => e.id === editingId)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Content Sharing Portal
            </h1>
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
        <Nav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          entryCount={entries.length}
        />

        <div className="py-6">
          {activeTab === 'dashboard' && (
            <Dashboard entries={entries} onEdit={handleEdit} />
          )}
          {activeTab === 'add' && (
            <EntryForm
              entries={entries}
              editingEntry={editingEntry}
              onSave={handleSave}
              onCancel={() => {
                setEditingId(null);
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
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
