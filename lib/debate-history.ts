export interface DebateRecord {
  id: string;
  topic: string;
  date: string; // ISO
  type: 'ai' | 'realtime' | 'team' | 'mun';
  rounds: number;
  transcript: Array<{ speaker: string; text: string; round: number }>;
  feedback?: {
    score?: number;
    strengths?: string[];
    improvements?: string[];
  } | null;
}

const KEY_PREFIX = 'debate_history_';

export function saveDebate(userId: string, record: Omit<DebateRecord, 'id' >) {
  const key = KEY_PREFIX + userId;
  const existing = localStorage.getItem(key);
  const arr: DebateRecord[] = existing ? JSON.parse(existing) : [];
  const newRecord: DebateRecord = { ...record, id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}` };
  arr.unshift(newRecord);
  localStorage.setItem(key, JSON.stringify(arr));
  return newRecord;
}

export function getDebateHistory(userId: string): DebateRecord[] {
  const key = KEY_PREFIX + userId;
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
}

export function clearDebateHistory(userId: string) {
  const key = KEY_PREFIX + userId;
  localStorage.removeItem(key);
}
