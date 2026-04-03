import { Tab } from '../types';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  entryCount: number;
}

const TABS: { key: Tab; label: (n: number) => string }[] = [
  { key: 'dashboard', label: () => 'Dashboard' },
  { key: 'add',       label: () => 'Log Entry' },
  { key: 'entries',   label: (n) => `All Entries (${n})` },
];

export default function Nav({ activeTab, onTabChange, entryCount }: Props) {
  return (
    <nav className="flex gap-1 border-b border-gray-200 mt-1">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === key
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {label(entryCount)}
        </button>
      ))}
    </nav>
  );
}
