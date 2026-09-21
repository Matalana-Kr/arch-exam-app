export type QuestionType = '단답' | '서술' | '나열(N가지)' | '계산' | '도해';

export interface Keyword {
  term: string;
  synonyms: string[];
  required: boolean;
  weight: number;
}

export interface Question {
  id: string;
  exam_type: string;
  year: number;
  round: number;
  number: number;
  points: number;
  type: QuestionType;
  chapter: string;
  frequency: number;
  dup_group_id: string;
  question_text: string;
  answer_text: string;
  explanation: string;
  keywords: Keyword[];
  required_count: number;
  target_number?: number | null;
  target_unit?: string | null;
  question_image?: string | null;
  answer_image?: string | null;
  has_image?: boolean;
}

export interface ScoringResult {
  questionId: string;
  earnedPoints: number;
  maxPoints: number;
  isCorrect: boolean;
  isPartial: boolean;
  matchedKeywords: string[];
  missingKeywords: string[];
  userAnswer: string;
  feedback: string;
  userOverride?: 'correct' | 'wrong' | null; // R1: 자기 채점 보정
}

export interface UserRecord {
  questionId: string;
  lastAnswer: string;
  lastEarnedPoints: number;
  lastResult: 'correct' | 'partial' | 'wrong';
  wrongCount: number;
  attemptCount: number;
  lastAttemptDate: string;
  bookmarked: boolean;
  memo: string;
  userOverride?: 'correct' | 'wrong' | null;
}

export type StudyMode = 'answer' | 'exam'; // 정답모드 (학습용) vs 일반모드 (시험용)
export type QuestionSetType = 'exam_round' | 'random' | 'wrong' | 'chapter';
