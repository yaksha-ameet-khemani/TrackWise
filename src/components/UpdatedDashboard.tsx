import { useState } from "react";
import { Entry } from "../types";
import { CLIENTS } from "../constants";

interface Props {
  entries: Entry[];
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
  const normalizeMilestone = (m: string): string => {
    const s = m.trim();
    if (!s) return "Assessment";
    if (/assignment/i.test(s)) return "Assignment";
    if (/mock/i.test(s)) return "Mock";
    if (/review|demo/i.test(s)) return "Review";
    return "Assessment";
  };

  const milestoneCounts: Record<string, number> = {};
  const rawUnknownCounts: Record<string, number> = {};
  for (const e of rows) {
    const key = normalizeMilestone(e.milestone || "");
    milestoneCounts[key] = (milestoneCounts[key] || 0) + 1;
    if (key === "Unknown") {
      const raw = e.milestone?.trim() || "(blank)";
      rawUnknownCounts[raw] = (rawUnknownCounts[raw] || 0) + 1;
    }
  }

  const assessment = milestoneCounts["Assessment"] ?? 0;
  const assignment = milestoneCounts["Assignment"] ?? 0;
  const mock = milestoneCounts["Mock"] ?? 0;
  const review = milestoneCounts["Review"] ?? 0;
  const unknown = milestoneCounts["Unknown"] ?? 0;
  const rawUnknownEntries = Object.entries(rawUnknownCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className={`text-base font-semibold ${accentClass}`}>{title}</h2>
        <span className="text-xs text-gray-400">{subtitle}</span>
        <span className="ml-auto text-3xl font-bold text-gray-900">
          {total}
        </span>
        <span className="text-sm text-gray-400">total</span>
      </div>
      {total === 0 ? (
        <p className="text-sm text-gray-400 mt-3">
          No entries for the selected period.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4 mt-3">
          {/* Shared total */}
          <div className="flex flex-wrap gap-3 border border-gray-200 rounded-lg p-3">
            <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-teal-50 border-teal-200 text-teal-800">
              <span className="text-2xl font-bold">{total}</span>
              <span className="text-xs font-medium mt-0.5 text-center leading-tight">
                Shared
              </span>
            </div>
          </div>

          {/* Milestone breakdown */}
          <div className="flex flex-wrap gap-3 border border-gray-200 rounded-lg p-3">
            {assessment > 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-indigo-50 border-indigo-200 text-indigo-800">
                <span className="text-2xl font-bold">{assessment}</span>
                <span className="text-xs font-medium mt-0.5 text-center leading-tight">Assessment</span>
              </div>
            )}
            {assignment > 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-cyan-50 border-cyan-200 text-cyan-800">
                <span className="text-2xl font-bold">{assignment}</span>
                <span className="text-xs font-medium mt-0.5 text-center leading-tight">Assignment</span>
              </div>
            )}
            {mock > 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-amber-50 border-amber-200 text-amber-800">
                <span className="text-2xl font-bold">{mock}</span>
                <span className="text-xs font-medium mt-0.5 text-center leading-tight">Mock</span>
              </div>
            )}
            {review > 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-pink-50 border-pink-200 text-pink-800">
                <span className="text-2xl font-bold">{review}</span>
                <span className="text-xs font-medium mt-0.5 text-center leading-tight">Review / Demo</span>
              </div>
            )}
            {unknown > 0 && (
              <div className="flex flex-col rounded-lg border px-4 py-3 bg-gray-100 border-gray-300 text-gray-600">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold">{unknown}</span>
                  <span className="text-xs font-medium">No milestone set</span>
                </div>
                <div className="flex flex-col gap-1">
                  {rawUnknownEntries.map(([raw, count]) => (
                    <div key={raw} className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-800">{count}×</span>
                      <span className="italic text-gray-500">{raw}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneStatusCard({
  title,
  rows,
  accentClass,
}: {
  title: string;
  rows: Entry[];
  accentClass: string;
}) {
  // Shared = everything except Feedback Received and Rejected
  const shared = rows.filter(
    (e) => e.status !== "Feedback Received" && e.status !== "Rejected",
  );
  const feedbackReceived = rows.filter((e) => e.status === "Feedback Received");
  const rejected = rows.filter((e) => e.status === "Rejected");

  const metrics = [
    {
      label: "Shared",
      count: shared.length,
      style: "bg-purple-50 border-purple-200 text-purple-800",
    },
    {
      label: "Feedback Received",
      count: feedbackReceived.length,
      style: "bg-amber-50 border-amber-200 text-amber-800",
    },
    {
      label: "Rejected",
      count: rejected.length,
      style: "bg-red-50 border-red-200 text-red-800",
    },
  ];

  // Same normalization as AllEntries
  const normalizeMilestone = (m: string): string => {
    const s = m.trim();
    if (/assignment/i.test(s)) return "Assignment";
    if (/review|demo/i.test(s)) return "Review / Demo";
    return "Assessment"; // mock, blank, and unrecognised values count as Assessment
  };

  const normalizedCounts: Record<string, number> = {};
  for (const e of shared) {
    const key = normalizeMilestone(e.milestone || "");
    if (key) normalizedCounts[key] = (normalizedCounts[key] || 0) + 1;
  }

  const assessments = normalizedCounts["Assessment"] ?? 0;
  const assignments = normalizedCounts["Assignment"] ?? 0;
  const reviews = normalizedCounts["Review / Demo"] ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className={`text-base font-semibold ${accentClass}`}>{title}</h2>
        <span className="ml-auto text-3xl font-bold text-gray-900">
          {rows.length}
        </span>
        <span className="text-sm text-gray-400">total</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 mt-3">
          No entries for the selected period.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4 mt-3">
          {/* Cell 1: Status metrics */}
          <div className="flex flex-wrap gap-3 border border-gray-200 rounded-lg p-3">
            {metrics.map(({ label, count, style }) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] ${style}`}
              >
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-xs font-medium mt-0.5 text-center leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Cell 2: Assessment / Assignment */}
          <div className="flex flex-wrap gap-3 border border-gray-200 rounded-lg p-3">
            <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-indigo-50 border-indigo-200 text-indigo-800">
              <span className="text-2xl font-bold">{assessments}</span>
              <span className="text-xs font-medium mt-0.5 text-center leading-tight">
                Assessment
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-cyan-50 border-cyan-200 text-cyan-800">
              <span className="text-2xl font-bold">{assignments}</span>
              <span className="text-xs font-medium mt-0.5 text-center leading-tight">
                Assignment
              </span>
            </div>
          </div>

          {/* Cell 3: Review & Demo */}
          <div className="flex flex-wrap gap-3 border border-gray-200 rounded-lg p-3">
            <div className="flex flex-col items-center justify-center rounded-lg border px-5 py-3 min-w-[140px] bg-pink-50 border-pink-200 text-pink-800">
              <span className="text-2xl font-bold">{reviews}</span>
              <span className="text-xs font-medium mt-0.5 text-center leading-tight">
                Review / Demo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* New / unknown milestone values not in MILESTONES constant */}
      {/* {rows.length > 0 && unknownMilestones.length > 0 && (
        <div className="mt-4 border border-dashed border-amber-300 rounded-lg p-3 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 mb-2">
            New milestone values found in data (not in known list — decide where to place them):
          </p>
          <div className="flex flex-wrap gap-2">
            {unknownMilestones.map(([label, count]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-xs text-amber-800"
              >
                <span className="font-bold">{count}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      )} */}
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
        <MilestoneStatusCard
          title="Project"
          rows={mfRows}
          accentClass="text-purple-700"
        />
        <MilestoneStatusCard
          title="Coding"
          rows={sfRows}
          accentClass="text-blue-700"
        />
        <SectionCard
          title="Skill Assist Handson"
          // subtitle="Entries with Skill Assist enabled"
          subtitle=""
          total={saRows.length}
          rows={saRows}
          accentClass="text-teal-700"
        />
      </div>
    </div>
  );
}
