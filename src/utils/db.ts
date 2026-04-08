import { supabase } from '../lib/supabase';
import { Entry } from '../types';

// ── column mapping ────────────────────────────────────────────────────────────

// DB row (snake_case) → Entry (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Entry {
  return {
    id: row.id,
    date: row.date,
    client: row.client,
    programName: row.program_name,
    trackName: row.track_name,
    skill: row.skill,
    questionShared: row.question_shared,
    type: row.type,
    skillAssist: row.skill_assist,
    milestone: row.milestone,
    learningPath: row.learning_path,
    grading: row.grading,
    csdm: row.csdm,
    autogradingEta: row.autograding_eta,
    status: row.status,
    issues: row.issues,
    courseCorrection: row.course_correction,
    remarks: row.remarks,
    isReplaced: row.is_replaced,
    replacedById: row.replaced_by_id,
    replacementReason: row.replacement_reason,
    replacesId: row.replaces_id,
  };
}

// Entry (camelCase) → DB row (snake_case)
function toRow(e: Entry) {
  return {
    id: e.id,
    date: e.date,
    client: e.client,
    program_name: e.programName,
    track_name: e.trackName,
    skill: e.skill,
    question_shared: e.questionShared,
    type: e.type,
    skill_assist: e.skillAssist,
    milestone: e.milestone,
    learning_path: e.learningPath,
    grading: e.grading,
    csdm: e.csdm,
    autograding_eta: e.autogradingEta,
    status: e.status,
    issues: e.issues,
    course_correction: e.courseCorrection,
    remarks: e.remarks,
    is_replaced: e.isReplaced,
    replaced_by_id: e.replacedById,
    replacement_reason: e.replacementReason,
    replaces_id: e.replacesId,
  };
}

// ── operations ────────────────────────────────────────────────────────────────

export async function fetchEntries(): Promise<Entry[]> {
  const PAGE = 1000;
  const all: Entry[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.map(fromRow));
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return all;
}

/** Insert or update a single entry */
export async function upsertEntry(entry: Entry): Promise<void> {
  const { error } = await supabase.from('entries').upsert(toRow(entry));
  if (error) throw error;
}

/** Insert or update multiple entries (used when a save touches 2–3 rows) */
export async function upsertEntries(entries: Entry[]): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await supabase.from('entries').upsert(entries.map(toRow));
  if (error) throw error;
}

/** Delete a single entry by id */
export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

/** Bulk insert — used by the one-time seed script only */
export async function seedEntries(entries: Entry[]): Promise<void> {
  const BATCH = 200;
  for (let i = 0; i < entries.length; i += BATCH) {
    const { error } = await supabase
      .from('entries')
      .upsert(entries.slice(i, i + BATCH).map(toRow));
    if (error) throw error;
    console.log(`Seeded ${Math.min(i + BATCH, entries.length)} / ${entries.length}`);
  }
}
