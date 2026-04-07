import { useState } from "react";
import { Entry } from "../types";
import { STATUSES, CLIENTS } from "../constants";

interface Props {
  entries: Entry[];
}

const STATUS_STYLE: Record<string, { card: string; dot: string }> = {
  Approved: {
    card: "bg-green-50 border-green-200 text-green-800",
    dot: "bg-green-500",
  },
  "Under Review": {
    card: "bg-amber-50 border-amber-200 text-amber-800",
    dot: "bg-amber-500",
  },
  Pending: {
    card: "bg-blue-50 border-blue-200 text-blue-800",
    dot: "bg-blue-500",
  },
  Rejected: {
    card: "bg-red-50 border-red-200 text-red-800",
    dot: "bg-red-500",
  },
  "Closed program": {
    card: "bg-gray-100 border-gray-300 text-gray-700",
    dot: "bg-gray-400",
  },
};

const DEFAULT_STYLE = {
  card: "bg-slate-50 border-slate-200 text-slate-700",
  dot: "bg-slate-400",
};

function StatusBreakdown({ rows }: { rows: Entry[] }) {
  const total = rows.length;

  // Collect all statuses present in this slice
  const statusSet = new Set(rows.map((e) => e.status || "Unknown"));
  const allStatuses = [
    ...STATUSES.filter((s) => statusSet.has(s)),
    ...[...statusSet].filter((s) => !STATUSES.includes(s)),
  ];

  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {allStatuses.map((status) => {
        const count = rows.filter(
          (e) => (e.status || "Unknown") === status,
        ).length;
        if (count === 0) return null;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const style = STATUS_STYLE[status] ?? DEFAULT_STYLE;
        return (
          <div
            key={status}
            className={`flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[120px] ${style.card}`}
          >
            <span className="text-2xl font-bold">{count}</span>
            <span className="text-xs font-medium mt-0.5 text-center leading-tight">
              {status}
            </span>
            <span className="text-xs opacity-60 mt-1">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  total,
  rows,
  accentClass,
}: {
  title: string;
  subtitle: string;
  total: number;
  rows: Entry[];
  accentClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-baseline gap-3">
        <h2 className={`text-base font-semibold ${accentClass}`}>{title}</h2>
        <span className="text-xs text-gray-400">{subtitle}</span>
        <span className="ml-auto text-3xl font-bold text-gray-900">
          {total}
        </span>
        <span className="text-sm text-gray-400">total shared</span>
      </div>
      {total === 0 ? (
        <p className="text-sm text-gray-400 mt-3">
          No entries for the selected period.
        </p>
      ) : (
        <StatusBreakdown rows={rows} />
      )}
    </div>
  );
}

const INP =
  "px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400";

export default function UpdatedDashboard({ entries }: Props) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [client, setClient] = useState("");

  // Only active (non-replaced) entries
  let base = entries.filter((e) => !e.isReplaced);
  if (dateFrom) base = base.filter((e) => e.date >= dateFrom);
  if (dateTo) base = base.filter((e) => e.date <= dateTo);
  if (client) base = base.filter((e) => e.client === client);

  const hasSkillAssist = (e: Entry) =>
    e.skillAssist.trim().toLowerCase().startsWith("yes");

  // MF = MFA variants WITHOUT Skill Assist
  const mfRows = base.filter(
    (e) =>
      (e.type === "MFA" || e.type === "MFA-Manual" || e.type === "MFA + MCQ") &&
      !hasSkillAssist(e),
  );

  // SF = SF variants WITHOUT Skill Assist
  const sfRows = base.filter(
    (e) => (e.type === "SF" || e.type === "SF + MCQ") && !hasSkillAssist(e),
  );

  // Skill Assist = entries where skillAssist is "Yes""
  const saRows = base.filter((e) => hasSkillAssist(e));

  const hasFilter = dateFrom || dateTo || client;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-600">
          Filter by date:
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={INP}
          title="From date"
        />
        <span className="text-sm text-gray-400">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={INP}
          title="To date"
        />
        <span className="text-sm font-medium text-gray-600 ml-2">Client:</span>
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className={INP}
        >
          <option value="">All clients</option>
          {CLIENTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {hasFilter && (
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setClient("");
            }}
            className={`${INP} text-gray-500 hover:bg-gray-50`}
          >
            Clear
          </button>
        )}
        {hasFilter && (
          <span className="text-xs text-gray-400 ml-1">
            Showing {base.length} entries
            {client && ` · ${client}`}
            {dateFrom && ` from ${dateFrom}`}
            {dateTo && ` to ${dateTo}`}
          </span>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-5">
        <SectionCard
          title="MF (MFA)"
          subtitle="Includes MFA, MFA-Manual, MFA + MCQ"
          total={mfRows.length}
          rows={mfRows}
          accentClass="text-purple-700"
        />
        <SectionCard
          title="SF"
          subtitle="Includes SF, SF + MCQ"
          total={sfRows.length}
          rows={sfRows}
          accentClass="text-blue-700"
        />
        <SectionCard
          title="Skill Assist"
          subtitle="Entries with Skill Assist enabled"
          total={saRows.length}
          rows={saRows}
          accentClass="text-teal-700"
        />
      </div>
    </div>
  );
}
