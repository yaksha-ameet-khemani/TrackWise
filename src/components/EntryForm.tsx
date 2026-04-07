import { useState, useEffect, useRef } from "react";
import { Entry } from "../types";
import {
  CLIENTS,
  SKILLS,
  TYPES,
  MILESTONES,
  GRADINGS,
  STATUSES,
  SKILL_ASSIST_OPTS,
  LEARNING_PATH_OPTS,
} from "../constants";

function ClientCombobox({
  value,
  onChange,
  entries,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: Entry[];
}) {
  const [inputVal, setInputVal] = useState(value);
  const [open, setOpen] = useState(false);
  const [extraClients, setExtraClients] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const entryClients = [
    ...new Set(entries.map((e) => e.client).filter(Boolean)),
  ];
  const allClients = [
    ...new Set([...CLIENTS, ...entryClients, ...extraClients]),
  ];

  const filtered = inputVal.trim()
    ? allClients.filter((c) => c.toLowerCase().includes(inputVal.toLowerCase()))
    : allClients;

  const exactMatch = allClients.some(
    (c) => c.toLowerCase() === inputVal.trim().toLowerCase(),
  );
  const canCreate = inputVal.trim() !== "" && !exactMatch;

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        if (!allClients.includes(inputVal)) setInputVal(value);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  const select = (client: string) => {
    onChange(client);
    setInputVal(client);
    setOpen(false);
  };

  const create = () => {
    const name = inputVal.trim();
    if (!name) return;
    setExtraClients((prev) => [...prev, name]);
    onChange(name);
    setOpen(false);
  };

  const INPUT_CLS =
    "w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={INPUT_CLS}
        placeholder="Type or select client…"
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-52 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => select(c)}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 ${
                c === value ? "font-semibold text-blue-700" : "text-gray-900"
              }`}
            >
              {c}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onClick={create}
              className="w-full text-left px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 border-t border-gray-100 font-medium"
            >
              + Create &ldquo;{inputVal.trim()}&rdquo;
            </button>
          )}
          {filtered.length === 0 && !canCreate && (
            <p className="px-3 py-2 text-xs text-gray-400">No clients found</p>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionCombobox({
  value,
  onChange,
  entries,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: Entry[];
}) {
  const [inputVal, setInputVal] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allQuestions = [...new Set(entries.map((e) => e.questionShared).filter(Boolean))];

  const filtered = inputVal.trim()
    ? allQuestions.filter((q) => q.toLowerCase().includes(inputVal.toLowerCase()))
    : allQuestions;

  const exactMatch = allQuestions.some(
    (q) => q.toLowerCase() === inputVal.trim().toLowerCase()
  );
  const canUseNew = inputVal.trim() !== "" && !exactMatch;

  useEffect(() => { setInputVal(value); }, [value]);

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  const select = (q: string) => { onChange(q); setInputVal(q); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={inputVal}
        onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Type or search a question…"
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-56 overflow-y-auto">
          {filtered.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => select(q)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 ${
                q === value ? "font-semibold text-blue-700" : "text-gray-800"
              }`}
            >
              {q}
            </button>
          ))}
          {canUseNew && (
            <button
              type="button"
              onClick={() => { onChange(inputVal.trim()); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-green-700 hover:bg-green-50 border-t border-gray-100 font-medium"
            >
              + Use new: &ldquo;{inputVal.trim()}&rdquo;
            </button>
          )}
          {filtered.length === 0 && !canUseNew && (
            <p className="px-3 py-2 text-xs text-gray-400">No matching questions</p>
          )}
        </div>
      )}
    </div>
  );
}

function ReplacesCombobox({
  value,
  onChange,
  activeEntries,
}: {
  value: string;
  onChange: (v: string) => void;
  activeEntries: Entry[];
}) {
  // Derive display label: if value is an entry ID show its label, else show value as-is (free text)
  const entryLabel = (e: Entry) =>
    `${e.date} | ${e.client} | ${e.skill} | ${
      e.questionShared.length > 60 ? e.questionShared.slice(0, 60) + "…" : e.questionShared
    }`;

  const matchedEntry = activeEntries.find((e) => e.id === value);
  const [inputVal, setInputVal] = useState(matchedEntry ? entryLabel(matchedEntry) : value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matched = activeEntries.find((e) => e.id === value);
    setInputVal(matched ? entryLabel(matched) : value);
  }, [value]);

  const filtered = inputVal.trim()
    ? activeEntries.filter((e) =>
        entryLabel(e).toLowerCase().includes(inputVal.toLowerCase())
      )
    : activeEntries;

  const hasExactMatch = activeEntries.some((e) => e.id === value);
  const canUseNew = inputVal.trim() !== "" && !hasExactMatch;

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  const select = (e: Entry) => {
    onChange(e.id);
    setInputVal(entryLabel(e));
    setOpen(false);
  };

  const useNew = () => {
    onChange(inputVal.trim());
    setOpen(false);
  };

  const AMBER_INPUT =
    "w-full px-3 py-1.5 text-sm border border-amber-400 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400";

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={inputVal}
        onChange={(e) => { setInputVal(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className={AMBER_INPUT}
        placeholder="Search or type a question…"
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-20 w-full bg-white border border-amber-300 rounded-md shadow-lg mt-1 max-h-56 overflow-y-auto">
          {filtered.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => select(e)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 ${
                e.id === value ? "font-semibold text-amber-700" : "text-gray-800"
              }`}
            >
              {entryLabel(e)}
            </button>
          ))}
          {filtered.length === 0 && !canUseNew && (
            <p className="px-3 py-2 text-xs text-gray-400">No matching entries</p>
          )}
          {canUseNew && (
            <button
              type="button"
              onClick={useNew}
              className="w-full text-left px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 border-t border-gray-100 font-medium"
            >
              + Add as new: &ldquo;{inputVal.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  entries: Entry[];
  editingEntry?: Entry;
  replacingEntry?: Entry;
  onSave: (data: Omit<Entry, "id">, id?: string) => void;
  onCancel: () => void;
}

const EMPTY: Omit<Entry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  client: "",
  programName: "",
  trackName: "",
  skill: "",
  questionShared: "",
  type: "MFA",
  skillAssist: "",
  milestone: "Actual",
  learningPath: "",
  grading: "AutoGraded",
  csdm: "",
  autogradingEta: "",
  status: "Under Review",
  issues: "",
  courseCorrection: "",
  remarks: "",
  isReplaced: false,
  replacedById: "",
  replacementReason: "",
  replacesId: "",
};

const INPUT =
  "w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500";
const LABEL =
  "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1";

function normalizeSkill(skill: string): string {
  if (!skill || SKILLS.includes(skill)) return skill;
  // Java variants: "Java L1"–"Java L5", "Java(Day 1)", "Java(Day 1 & 2)", etc.
  if (/^Java\s+L\d+$/i.test(skill) || /^Java\s*\(Day/i.test(skill)) return "Java";
  // Junit variants: "Junit-5"
  if (/^Junit[-\s]/i.test(skill)) return "Junit";
  // MCQ variants: "MCQ's"
  if (/^MCQ/i.test(skill)) return "MCQ";
  // Python+Selenium → Python-Selenium (check before generic Python[-+] catch-all)
  if (/^Python\+Selenium$/i.test(skill)) return "Python-Selenium";
  // Python-Pyspark → Pyspark
  if (/^Python[-+]Pyspark$/i.test(skill)) return "Pyspark";
  // Python-Pytest → Pytest
  if (/^Python[-+]Pytest$/i.test(skill)) return "Pytest";
  // Python day variants: "Python (Day 1)", "Python(Day 1 to 3)", "Python(Day 22)", etc.
  if (/^Python\s*\(Day/i.test(skill) || /^Python\s+\(Day/i.test(skill)) return "Python";
  // Python Intermediate
  if (/^Python\s+Intermediate$/i.test(skill)) return "Python";
  // Remaining Python-* / Python(* catch-all: Python-Numpy, Python-Pandas, Python-SQL, etc.
  if (/^Python[-+(]/i.test(skill)) return "Python";
  return skill;
}

function initForReplacing(entry: Entry): Omit<Entry, "id"> {
  return {
    ...entry,
    skill: normalizeSkill(entry.skill),
    date: new Date().toISOString().slice(0, 10),
    replacesId: entry.id,
    remarks: `Replacement of "${entry.questionShared}" shared on ${entry.date} for ${entry.client}`,
    questionShared: "",
    isReplaced: false,
    replacedById: "",
    replacementReason: "",
  };
}

export default function EntryForm({
  entries,
  editingEntry,
  replacingEntry,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<Omit<Entry, "id">>(() => {
    if (replacingEntry) return initForReplacing(replacingEntry);
    if (editingEntry) return { ...editingEntry, skill: normalizeSkill(editingEntry.skill) };
    return { ...EMPTY };
  });
  const [isReplacement, setIsReplacement] = useState(
    !!editingEntry?.replacesId || !!replacingEntry,
  );

  useEffect(() => {
    if (replacingEntry) {
      setForm(initForReplacing(replacingEntry));
      setIsReplacement(true);
    } else if (editingEntry) {
      setForm({ ...editingEntry, skill: normalizeSkill(editingEntry.skill) });
      setIsReplacement(!!editingEntry.replacesId);
    } else {
      setForm({ ...EMPTY });
      setIsReplacement(false);
    }
  }, [editingEntry, replacingEntry]);

  const set = <K extends keyof Omit<Entry, "id">>(
    key: K,
    value: Omit<Entry, "id">[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const activeEntries = entries.filter(
    (e) => !e.isReplaced && e.id !== editingEntry?.id,
  );

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.date || !form.client || !form.skill || !form.questionShared) {
      alert(
        form.type === "MCQ"
          ? "Please fill required fields: Date, Client, Skill/Tool, No. of Questions."
          : "Please fill required fields: Date, Client, Skill/Tool, Questions Shared.",
      );
      return;
    }
    if (isReplacement && !form.replacesId) {
      alert("Please select or enter the question this replaces.");
      return;
    }
    onSave(
      { ...form, replacesId: isReplacement ? form.replacesId : "" },
      editingEntry?.id,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6"
    >
      <h2 className="text-base font-semibold text-gray-900 mb-5">
        {editingEntry ? "Edit Entry" : replacingEntry ? `Replace: ${replacingEntry.questionShared.length > 60 ? replacingEntry.questionShared.slice(0, 60) + "…" : replacingEntry.questionShared}` : "Log New Content Share"}
      </h2>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Date */}
        <div>
          <label className={LABEL}>
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className={INPUT}
          />
        </div>

        {/* Client */}
        <div>
          <label className={LABEL}>
            Client <span className="text-red-500">*</span>
          </label>
          <ClientCombobox
            value={form.client}
            onChange={(v) => set("client", v)}
            entries={entries}
          />
        </div>

        {/* Program Name */}
        <div>
          <label className={LABEL}>Name of Program</label>
          <input
            type="text"
            value={form.programName}
            onChange={(e) => set("programName", e.target.value)}
            className={INPUT}
          />
        </div>

        {/* Track Name */}
        <div>
          <label className={LABEL}>Track Name</label>
          <input
            type="text"
            value={form.trackName}
            onChange={(e) => set("trackName", e.target.value)}
            className={INPUT}
          />
        </div>

        {/* Skill */}
        <div>
          <label className={LABEL}>
            Assessments (Skill / Tool) <span className="text-red-500">*</span>
          </label>
          <select
            value={form.skill}
            onChange={(e) => set("skill", e.target.value)}
            className={INPUT}
          >
            <option value="">— select —</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className={LABEL}>MFA / SF / MCQ</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value as Entry["type"])}
            className={INPUT}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Milestone */}
        <div
          className={
            form.milestone.startsWith("Milestone ") ||
            form.milestone === "Milestone"
              ? "col-span-2"
              : ""
          }
        >
          <label className={LABEL}>Final Milestone</label>
          <div className="flex gap-2">
            <select
              value={
                form.milestone.startsWith("Milestone ")
                  ? "Milestone"
                  : form.milestone
              }
              onChange={(e) => {
                if (e.target.value === "Milestone") {
                  set("milestone", "Milestone 1");
                } else {
                  set("milestone", e.target.value);
                }
              }}
              className={INPUT}
            >
              <option value="">— select —</option>
              {MILESTONES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {form.milestone.startsWith("Milestone ") && (
              <select
                value={form.milestone.split(" ")[1] ?? "1"}
                onChange={(e) =>
                  set("milestone", `Milestone ${e.target.value}`)
                }
                className={`${INPUT} w-28 flex-shrink-0`}
                title="Milestone number"
              >
                {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Grading */}
        <div>
          <label className={LABEL}>Manual / AutoGraded</label>
          <select
            value={form.grading}
            onChange={(e) => set("grading", e.target.value as Entry["grading"])}
            className={INPUT}
          >
            <option value="">— select —</option>
            {GRADINGS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={LABEL}>
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={INPUT}
          >
            <option value="">— select —</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* CSDM */}
        <div>
          <label className={LABEL}>CSDM</label>
          <input
            type="text"
            value={form.csdm}
            onChange={(e) => set("csdm", e.target.value)}
            className={INPUT}
            placeholder="e.g. Mani, Pooja"
          />
        </div>

        {/* Autograding ETA */}
        <div>
          <label className={LABEL}>Intro to Autograding – ETA</label>
          <input
            type="text"
            value={form.autogradingEta}
            onChange={(e) => set("autogradingEta", e.target.value)}
            className={INPUT}
            placeholder="e.g. Already Autograded"
          />
        </div>

        {/* SkillAssist */}
        <div>
          <label className={LABEL}>SkillAssist</label>
          <select
            value={form.skillAssist}
            onChange={(e) => set("skillAssist", e.target.value)}
            className={INPUT}
          >
            <option value="">—</option>
            {SKILL_ASSIST_OPTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Learning Path — full width */}
      <div className="mb-4">
        <label className={LABEL}>Learning Paths – Digital Learning</label>
        <select
          value={form.learningPath}
          onChange={(e) => set("learningPath", e.target.value)}
          className={INPUT}
        >
          <option value="">—</option>
          {LEARNING_PATH_OPTS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* Questions Shared / No. of Questions — full width */}
      <div className="mb-4">
        {form.type === "MCQ" ? (
          <>
            <label className={LABEL}>
              No. of Questions <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.questionShared}
              onChange={(e) => set("questionShared", e.target.value)}
              className={INPUT}
              placeholder="Enter number of questions"
            />
          </>
        ) : replacingEntry ? (
          <>
            <label className={LABEL}>
              New Question <span className="text-red-500">*</span>
            </label>
            <QuestionCombobox
              value={form.questionShared}
              onChange={(v) => set("questionShared", v)}
              entries={entries}
            />
          </>
        ) : (
          <>
            <label className={LABEL}>
              Questions Shared <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.questionShared}
              onChange={(e) => set("questionShared", e.target.value)}
              rows={2}
              className={`${INPUT} resize-y`}
              placeholder="Enter the question / use-case name"
            />
          </>
        )}
      </div>

      {/* Issues / Course Correction / Remarks */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <label className={LABEL}>Issues Highlighted</label>
          <textarea
            value={form.issues}
            onChange={(e) => set("issues", e.target.value)}
            rows={2}
            className={`${INPUT} resize-y`}
          />
        </div>
        <div>
          <label className={LABEL}>Course Correction</label>
          <textarea
            value={form.courseCorrection}
            onChange={(e) => set("courseCorrection", e.target.value)}
            rows={2}
            className={`${INPUT} resize-y`}
          />
        </div>
        <div>
          <label className={LABEL}>Remarks</label>
          <textarea
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={2}
            className={`${INPUT} resize-y`}
          />
        </div>
      </div>

      {/* Replacement section — only available when logging a NEW entry */}
      {editingEntry ? (
        <div className="border border-gray-200 rounded-lg p-4 mb-5 bg-gray-50">
          <p className="text-xs text-gray-400 italic">
            Replacement linking is only available when logging a new entry. To replace this question, use <strong>Log Entry</strong> and fill in the new question's details there.
          </p>
        </div>
      ) : (
        <div
          className={`border rounded-lg p-4 mb-5 transition-colors ${
            isReplacement
              ? "border-amber-300 bg-amber-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={isReplacement}
              onChange={(e) => {
                setIsReplacement(e.target.checked);
                if (!e.target.checked) set("replacesId", "");
              }}
              className="rounded"
            />
            This new question replaces a previously shared question
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-5">
            Fill in the details of the <strong>new</strong> question above, then select the <strong>old</strong> question being replaced below.
          </p>

          {isReplacement && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Old question being replaced</label>
                <ReplacesCombobox
                  value={form.replacesId}
                  onChange={(v) => {
                    const original = entries.find((e) => e.id === v);
                    const autoRemark = original
                      ? `Replacement of "${original.questionShared}" shared on ${original.date} for ${original.client}`
                      : v.trim()
                      ? `Replacement of "${v.trim()}"`
                      : "";
                    setForm((prev) => ({
                      ...prev,
                      replacesId: v,
                      date: new Date().toISOString().slice(0, 10),
                      remarks: autoRemark,
                    }));
                  }}
                  activeEntries={activeEntries}
                />
              </div>
              <div>
                <label className={LABEL}>Reason for replacement</label>
                <input
                  type="text"
                  value={form.replacementReason}
                  onChange={(e) => set("replacementReason", e.target.value)}
                  placeholder="e.g. Swapped as per client feedback"
                  className={`${INPUT} border-amber-400 focus:ring-amber-400`}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit row */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          {editingEntry ? "Update Entry" : "Save Entry"}
        </button>
        {editingEntry && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
