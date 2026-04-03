import { useState, useEffect } from 'react';
import { Entry } from '../types';
import {
  CLIENTS, SKILLS, TYPES, MILESTONES, GRADINGS,
  STATUSES, SKILL_ASSIST_OPTS, LEARNING_PATH_OPTS,
} from '../constants';

interface Props {
  entries: Entry[];
  editingEntry?: Entry;
  onSave: (data: Omit<Entry, 'id'>, id?: string) => void;
  onCancel: () => void;
}

const EMPTY: Omit<Entry, 'id'> = {
  date: new Date().toISOString().slice(0, 10),
  client: '', programName: '', trackName: '', skill: '',
  questionShared: '', type: 'MFA', skillAssist: '',
  milestone: 'Actual', learningPath: '', grading: 'AutoGraded',
  csdm: '', autogradingEta: '', status: 'Under Review by client',
  issues: '', courseCorrection: '', remarks: '',
  isReplaced: false, replacedById: '', replacementReason: '', replacesId: '',
};

const INPUT = 'w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500';
const LABEL = 'block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1';

export default function EntryForm({ entries, editingEntry, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Entry, 'id'>>(
    editingEntry ? { ...editingEntry } : { ...EMPTY }
  );
  const [isReplacement, setIsReplacement] = useState(
    !!(editingEntry?.replacesId)
  );

  useEffect(() => {
    setForm(editingEntry ? { ...editingEntry } : { ...EMPTY });
    setIsReplacement(!!(editingEntry?.replacesId));
  }, [editingEntry]);

  const set = <K extends keyof Omit<Entry, 'id'>>(key: K, value: Omit<Entry, 'id'>[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const activeEntries = entries.filter(
    (e) => !e.isReplaced && e.id !== editingEntry?.id
  );

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.date || !form.client || !form.skill || !form.questionShared) {
      alert('Please fill required fields: Date, Client, Skill/Tool, Questions Shared.');
      return;
    }
    if (isReplacement && !form.replacesId) {
      alert('Please select which entry this replaces.');
      return;
    }
    onSave({ ...form, replacesId: isReplacement ? form.replacesId : '' }, editingEntry?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">
        {editingEntry ? 'Edit Entry' : 'Log New Content Share'}
      </h2>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Date */}
        <div>
          <label className={LABEL}>Date <span className="text-red-500">*</span></label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={INPUT} />
        </div>

        {/* Client */}
        <div>
          <label className={LABEL}>Client <span className="text-red-500">*</span></label>
          <select value={form.client} onChange={(e) => set('client', e.target.value)} className={INPUT}>
            <option value="">— select —</option>
            {CLIENTS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Program Name */}
        <div>
          <label className={LABEL}>Name of Program</label>
          <input type="text" value={form.programName} onChange={(e) => set('programName', e.target.value)} className={INPUT} />
        </div>

        {/* Track Name */}
        <div>
          <label className={LABEL}>Track Name</label>
          <input type="text" value={form.trackName} onChange={(e) => set('trackName', e.target.value)} className={INPUT} />
        </div>

        {/* Skill */}
        <div>
          <label className={LABEL}>Assessments (Skill / Tool) <span className="text-red-500">*</span></label>
          <select value={form.skill} onChange={(e) => set('skill', e.target.value)} className={INPUT}>
            <option value="">— select —</option>
            {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className={LABEL}>MFA / SF / MCQ</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value as Entry['type'])} className={INPUT}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Milestone */}
        <div>
          <label className={LABEL}>Final Milestone</label>
          <select value={form.milestone} onChange={(e) => set('milestone', e.target.value)} className={INPUT}>
            <option value="">— select —</option>
            {MILESTONES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Grading */}
        <div>
          <label className={LABEL}>Manual / AutoGraded</label>
          <select value={form.grading} onChange={(e) => set('grading', e.target.value as Entry['grading'])} className={INPUT}>
            <option value="">— select —</option>
            {GRADINGS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={LABEL}>Status / ETA <span className="text-red-500">*</span></label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={INPUT}>
            <option value="">— select —</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* CSDM */}
        <div>
          <label className={LABEL}>CSDM</label>
          <input type="text" value={form.csdm} onChange={(e) => set('csdm', e.target.value)} className={INPUT} placeholder="e.g. Mani, Pooja" />
        </div>

        {/* Autograding ETA */}
        <div>
          <label className={LABEL}>Intro to Autograding – ETA</label>
          <input type="text" value={form.autogradingEta} onChange={(e) => set('autogradingEta', e.target.value)} className={INPUT} placeholder="e.g. Already Autograded" />
        </div>

        {/* SkillAssist */}
        <div>
          <label className={LABEL}>SkillAssist</label>
          <select value={form.skillAssist} onChange={(e) => set('skillAssist', e.target.value)} className={INPUT}>
            <option value="">—</option>
            {SKILL_ASSIST_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Learning Path — full width */}
      <div className="mb-4">
        <label className={LABEL}>Learning Paths – Digital Learning</label>
        <select value={form.learningPath} onChange={(e) => set('learningPath', e.target.value)} className={INPUT}>
          <option value="">—</option>
          {LEARNING_PATH_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Questions Shared — full width */}
      <div className="mb-4">
        <label className={LABEL}>Questions Shared <span className="text-red-500">*</span></label>
        <textarea
          value={form.questionShared}
          onChange={(e) => set('questionShared', e.target.value)}
          rows={2}
          className={`${INPUT} resize-y`}
          placeholder="Enter the question / use-case name"
        />
      </div>

      {/* Issues / Course Correction / Remarks */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <label className={LABEL}>Issues Highlighted</label>
          <textarea value={form.issues} onChange={(e) => set('issues', e.target.value)} rows={2} className={`${INPUT} resize-y`} />
        </div>
        <div>
          <label className={LABEL}>Course Correction</label>
          <textarea value={form.courseCorrection} onChange={(e) => set('courseCorrection', e.target.value)} rows={2} className={`${INPUT} resize-y`} />
        </div>
        <div>
          <label className={LABEL}>Remarks</label>
          <textarea value={form.remarks} onChange={(e) => set('remarks', e.target.value)} rows={2} className={`${INPUT} resize-y`} />
        </div>
      </div>

      {/* Replacement section */}
      <div
        className={`border rounded-lg p-4 mb-5 transition-colors ${
          isReplacement
            ? 'border-amber-300 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-800">
          <input
            type="checkbox"
            checked={isReplacement}
            onChange={(e) => {
              setIsReplacement(e.target.checked);
              if (!e.target.checked) set('replacesId', '');
            }}
            className="rounded"
          />
          This entry replaces a previously shared question
        </label>

        {isReplacement && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Replaces question</label>
              <select
                value={form.replacesId}
                onChange={(e) => set('replacesId', e.target.value)}
                className={`${INPUT} border-amber-400 focus:ring-amber-400`}
              >
                <option value="">— select original entry —</option>
                {activeEntries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.date} | {e.client} | {e.skill} |{' '}
                    {e.questionShared.length > 50
                      ? e.questionShared.slice(0, 50) + '…'
                      : e.questionShared}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Reason for replacement</label>
              <input
                type="text"
                value={form.replacementReason}
                onChange={(e) => set('replacementReason', e.target.value)}
                placeholder="e.g. Swapped as per client feedback"
                className={`${INPUT} border-amber-400 focus:ring-amber-400`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit row */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          {editingEntry ? 'Update Entry' : 'Save Entry'}
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
