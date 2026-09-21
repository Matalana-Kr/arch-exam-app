import type { Question, ScoringResult, Keyword } from '../types';

const PARTICLES = [
  '에서의', '에서는', '에게서', '으로의', '으로써', '으로서', '에서의',
  '에서', '으로', '에게', '까지', '부터', '마저', '조차',
  '이나', '이란', '에는', '에도', '에만',
  '은', '는', '이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '만'
];

/**
 * 단일 어절에서 끝자리 조사 제거
 */
function stripParticleFromWord(word: string): string {
  let clean = word.replace(/[^a-z0-9가-힣]/g, '');
  let prev = '';
  while (prev !== clean) {
    prev = clean;
    for (const p of PARTICLES) {
      if (clean.length > p.length + 1 && clean.endsWith(p)) {
        clean = clean.slice(0, -p.length);
        break;
      }
    }
  }
  return clean;
}

/**
 * 한국어 조사 및 특수문자 제거 정규화 함수 (어절별 조사 제거 후 결합)
 */
export function normalizeKorean(text: string): string {
  if (!text) return '';
  
  const words = text.toLowerCase().split(/\s+/);
  const strippedWords = words.map(stripParticleFromWord).filter(w => w.length > 0);
  return strippedWords.join('');
}

/**
 * 단일 키워드가 텍스트에 포함되어 있는지 (동의어 포함) 검사
 */
export function checkKeywordMatch(userText: string, keyword: Keyword): boolean {
  const normUserText = normalizeKorean(userText);
  if (!normUserText) return false;

  // 원본 용어 검사
  const normTerm = normalizeKorean(keyword.term);
  if (normTerm && normUserText.includes(normTerm)) {
    return true;
  }

  // 동의어 검사
  for (const syn of keyword.synonyms) {
    const normSyn = normalizeKorean(syn);
    if (normSyn && normUserText.includes(normSyn)) {
      return true;
    }
  }

  // 4글자 이상의 경우 앞 3글자 이상 일치하는지 부분 검사
  if (normTerm.length >= 4) {
    const prefix = normTerm.slice(0, Math.floor(normTerm.length * 0.75));
    if (normUserText.includes(prefix)) {
      return true;
    }
  }

  return false;
}

/**
 * 계산 문제 채점 함수
 */
function scoreCalculationQuestion(question: Question, userAnswer: string): ScoringResult {
  const maxPoints = question.points;
  
  const userNums = (userAnswer.match(/[-+]?[0-9]*\.?[0-9]+/g) || []).map(Number);
  const targetNum = question.target_number;
  
  let isCorrect = false;
  let feedback = '';
  
  if (targetNum !== null && targetNum !== undefined) {
    const tolerance = Math.max(0.01, Math.abs(targetNum) * 0.02);
    isCorrect = userNums.some(num => Math.abs(num - targetNum) <= tolerance);
    
    if (isCorrect) {
      feedback = `정답 수치(${targetNum}${question.target_unit || ''})와 일치합니다.`;
    } else {
      feedback = `정답 수치(${targetNum}${question.target_unit || ''})와 불일치합니다.`;
    }
  } else {
    let matchCount = 0;
    for (const kw of question.keywords) {
      if (checkKeywordMatch(userAnswer, kw)) {
        matchCount++;
      }
    }
    isCorrect = matchCount > 0;
    feedback = isCorrect ? '계산 과정 및 수치가 부합합니다.' : '계산 수치 또는 필수 키워드가 누락되었습니다.';
  }

  return {
    questionId: question.id,
    earnedPoints: isCorrect ? maxPoints : 0,
    maxPoints,
    isCorrect,
    isPartial: false,
    matchedKeywords: isCorrect ? [String(targetNum || '정답')] : [],
    missingKeywords: isCorrect ? [] : [String(targetNum || '정답 수치')],
    userAnswer,
    feedback
  };
}

/**
 * 나열형 (N가지 쓰시오) 채점 함수
 */
function scoreListQuestion(question: Question, userAnswer: string): ScoringResult {
  const maxPoints = question.points;
  const reqCount = question.required_count || 1;
  
  const lines = userAnswer
    .split(/\n|(?=[①-⑩])|(?=\(\d+\))|(?=\d+\.)|,/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
    
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  const usedLines = new Set<number>();
  
  for (const kw of question.keywords) {
    let matched = false;
    for (let idx = 0; idx < lines.length; idx++) {
      if (usedLines.has(idx)) continue;
      if (checkKeywordMatch(lines[idx], kw)) {
        matched = true;
        usedLines.add(idx);
        matchedKeywords.push(kw.term);
        break;
      }
    }
    if (!matched) {
      missingKeywords.push(kw.term);
    }
  }
  
  const matchedCount = matchedKeywords.length;
  const isFullCorrect = matchedCount >= reqCount;
  const isPartial = matchedCount > 0 && matchedCount < reqCount;
  
  const ratio = Math.min(1.0, matchedCount / reqCount);
  const earnedPoints = Math.round(ratio * maxPoints * 10) / 10;
  
  const feedback = isFullCorrect
    ? `요구된 ${reqCount}가지 항목을 모두 정확히 작성했습니다.`
    : isPartial
      ? `요구된 ${reqCount}가지 중 ${matchedCount}개 항목이 충족되었습니다 (부분 점수 부여).`
      : `요구된 키워드가 포함되지 않았습니다.`;

  return {
    questionId: question.id,
    earnedPoints,
    maxPoints,
    isCorrect: isFullCorrect,
    isPartial,
    matchedKeywords,
    missingKeywords,
    userAnswer,
    feedback
  };
}

/**
 * 서술형 / 단답형 채점 함수
 */
function scoreDescriptiveQuestion(question: Question, userAnswer: string): ScoringResult {
  const maxPoints = question.points;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  let totalWeight = 0;
  let earnedWeight = 0;
  
  if (question.keywords.length === 0) {
    const normAns = normalizeKorean(question.answer_text);
    const normUser = normalizeKorean(userAnswer);
    const isCorrect = normAns.length > 0 && (normUser.includes(normAns) || normAns.includes(normUser));
    return {
      questionId: question.id,
      earnedPoints: isCorrect ? maxPoints : 0,
      maxPoints,
      isCorrect,
      isPartial: false,
      matchedKeywords: isCorrect ? [question.answer_text] : [],
      missingKeywords: isCorrect ? [] : [question.answer_text],
      userAnswer,
      feedback: isCorrect ? '정답과 일치합니다.' : '정답과 일치하지 않습니다.'
    };
  }

  for (const kw of question.keywords) {
    const weight = kw.weight || 1.0;
    totalWeight += weight;
    if (checkKeywordMatch(userAnswer, kw)) {
      matchedKeywords.push(kw.term);
      earnedWeight += weight;
    } else {
      missingKeywords.push(kw.term);
    }
  }

  const ratio = totalWeight > 0 ? earnedWeight / totalWeight : 0;
  const isFullCorrect = ratio >= 0.75;
  const isPartial = ratio >= 0.3 && !isFullCorrect;
  
  let earnedPoints = 0;
  if (isFullCorrect) {
    earnedPoints = maxPoints;
  } else if (isPartial) {
    earnedPoints = Math.round(ratio * maxPoints * 10) / 10;
  }

  const feedback = isFullCorrect
    ? '핵심 키워드가 충실히 반영되었습니다.'
    : isPartial
      ? '일부 핵심 키워드가 포함되었으나 추가 설명이 필요합니다 (부분 점수).'
      : '필수 핵심 키워드가 누락되었습니다.';

  return {
    questionId: question.id,
    earnedPoints,
    maxPoints,
    isCorrect: isFullCorrect,
    isPartial,
    matchedKeywords,
    missingKeywords,
    userAnswer,
    feedback
  };
}

/**
 * 통합 채점 메인 함수
 */
export function evaluateAnswer(question: Question, userAnswer: string): ScoringResult {
  const trimmed = (userAnswer || '').trim();
  if (!trimmed) {
    return {
      questionId: question.id,
      earnedPoints: 0,
      maxPoints: question.points,
      isCorrect: false,
      isPartial: false,
      matchedKeywords: [],
      missingKeywords: question.keywords.map(k => k.term),
      userAnswer: '',
      feedback: '답안이 입력되지 않았습니다.'
    };
  }

  switch (question.type) {
    case '계산':
      return scoreCalculationQuestion(question, trimmed);
    case '나열(N가지)':
      return scoreListQuestion(question, trimmed);
    case '단답':
    case '서술':
    case '도해':
    default:
      return scoreDescriptiveQuestion(question, trimmed);
  }
}
