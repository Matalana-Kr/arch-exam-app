import type { UserRecord, ScoringResult } from '../types';

const STORAGE_KEY = 'ARCH_EXAM_USER_RECORDS_V1';

export function getAllRecords(): Record<string, UserRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user records from localStorage', e);
    return {};
  }
}

export function saveAllRecords(records: Record<string, UserRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save user records to localStorage', e);
  }
}

export function getUserRecord(questionId: string): UserRecord | null {
  const all = getAllRecords();
  return all[questionId] || null;
}

export function saveScoringResult(
  result: ScoringResult,
  bookmarked?: boolean,
  memo?: string
): UserRecord {
  const all = getAllRecords();
  const existing = all[result.questionId];

  let wrongCount = existing ? existing.wrongCount : 0;
  let resultStatus: 'correct' | 'partial' | 'wrong' = 'wrong';

  if (result.isCorrect) {
    resultStatus = 'correct';
    if (wrongCount > 0) {
      wrongCount = Math.max(0, wrongCount - 1);
    }
  } else if (result.isPartial) {
    resultStatus = 'partial';
  } else {
    resultStatus = 'wrong';
    wrongCount += 1;
  }

  const updated: UserRecord = {
    questionId: result.questionId,
    lastAnswer: result.userAnswer,
    lastEarnedPoints: result.earnedPoints,
    lastResult: resultStatus,
    wrongCount,
    attemptCount: (existing ? existing.attemptCount : 0) + 1,
    lastAttemptDate: new Date().toISOString(),
    bookmarked: bookmarked !== undefined ? bookmarked : (existing ? existing.bookmarked : false),
    memo: memo !== undefined ? memo : (existing ? existing.memo : ''),
    userOverride: result.userOverride !== undefined ? result.userOverride : (existing ? existing.userOverride : null)
  };

  all[result.questionId] = updated;
  saveAllRecords(all);
  return updated;
}

export function toggleBookmark(questionId: string): boolean {
  const all = getAllRecords();
  const existing = all[questionId] || {
    questionId,
    lastAnswer: '',
    lastEarnedPoints: 0,
    lastResult: 'wrong',
    wrongCount: 0,
    attemptCount: 0,
    lastAttemptDate: new Date().toISOString(),
    bookmarked: false,
    memo: '',
    userOverride: null
  };

  existing.bookmarked = !existing.bookmarked;
  all[questionId] = existing;
  saveAllRecords(all);
  return existing.bookmarked;
}

export function saveMemo(questionId: string, memo: string): void {
  const all = getAllRecords();
  const existing = all[questionId] || {
    questionId,
    lastAnswer: '',
    lastEarnedPoints: 0,
    lastResult: 'wrong',
    wrongCount: 0,
    attemptCount: 0,
    lastAttemptDate: new Date().toISOString(),
    bookmarked: false,
    memo: '',
    userOverride: null
  };

  existing.memo = memo;
  all[questionId] = existing;
  saveAllRecords(all);
}

export function setUserOverride(questionId: string, override: 'correct' | 'wrong' | null): UserRecord {
  const all = getAllRecords();
  const existing = all[questionId];
  if (existing) {
    existing.userOverride = override;
    if (override === 'correct') {
      existing.lastResult = 'correct';
      existing.wrongCount = 0;
    } else if (override === 'wrong') {
      existing.lastResult = 'wrong';
      existing.wrongCount += 1;
    }
    all[questionId] = existing;
    saveAllRecords(all);
    return existing;
  }
  
  const created: UserRecord = {
    questionId,
    lastAnswer: '',
    lastEarnedPoints: override === 'correct' ? 4 : 0,
    lastResult: override === 'correct' ? 'correct' : 'wrong',
    wrongCount: override === 'wrong' ? 1 : 0,
    attemptCount: 1,
    lastAttemptDate: new Date().toISOString(),
    bookmarked: false,
    memo: '',
    userOverride: override
  };
  all[questionId] = created;
  saveAllRecords(all);
  return created;
}
