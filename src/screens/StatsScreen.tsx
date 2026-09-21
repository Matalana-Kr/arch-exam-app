import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Question, UserRecord } from '../types';
import { saveAllRecords } from '../utils/storage';

interface StatsScreenProps {
  questions: Question[];
  userRecords: Record<string, UserRecord>;
  onResetData: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  questions,
  userRecords,
  onResetData
}) => {
  const stats = useMemo(() => {
    let totalAttempts = 0;
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;

    const solvedQIds = new Set<string>();

    Object.values(userRecords).forEach(rec => {
      if (rec.attemptCount > 0) {
        solvedQIds.add(rec.questionId);
        totalAttempts += rec.attemptCount;
        if (rec.lastResult === 'correct') correctCount++;
        else if (rec.lastResult === 'partial') partialCount++;
        else wrongCount++;
      }
    });

    const correctRate = solvedQIds.size > 0
      ? Math.round((correctCount / solvedQIds.size) * 100)
      : 0;

    // 단원별 통계
    const chapterMap = new Map<string, { total: number; correct: number; solved: number }>();
    questions.forEach(q => {
      const chap = q.chapter || '기타';
      if (!chapterMap.has(chap)) {
        chapterMap.set(chap, { total: 0, correct: 0, solved: 0 });
      }
      const item = chapterMap.get(chap)!;
      item.total++;
      const rec = userRecords[q.id];
      if (rec && rec.attemptCount > 0) {
        item.solved++;
        if (rec.lastResult === 'correct') {
          item.correct++;
        }
      }
    });

    const chapterList = Array.from(chapterMap.entries()).map(([chapter, data]) => ({
      chapter,
      ...data,
      rate: data.solved > 0 ? Math.round((data.correct / data.solved) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    return {
      solvedCount: solvedQIds.size,
      totalCount: questions.length,
      correctRate,
      correctCount,
      partialCount,
      wrongCount,
      totalAttempts,
      chapterList
    };
  }, [questions, userRecords]);

  const handleClearHistory = () => {
    if (window.confirm('정말로 모든 학습 이력(오답 노트, 풀이 기록)을 초기화하시겠습니까?')) {
      saveAllRecords({});
      onResetData();
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      <div>
        <h2 className="text-base font-black text-slate-800">학습 통계 및 취약점 분석</h2>
        <p className="text-xs text-slate-500">나의 실시간 학습 현황과 과목별 달성도</p>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">누적 정답률</span>
          <span className="text-xs font-black text-blue-600">
            {stats.solvedCount} / {stats.totalCount}문항 풀이
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-black text-slate-900">{stats.correctRate}%</span>
          <span className="text-xs text-slate-400 font-medium">평균 달성률</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <div className="text-base font-black text-emerald-600">{stats.correctCount}</div>
            <div className="text-[10px] text-emerald-700 font-semibold">정답</div>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl">
            <div className="text-base font-black text-amber-600">{stats.partialCount}</div>
            <div className="text-[10px] text-amber-700 font-semibold">부분 점수</div>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl">
            <div className="text-base font-black text-rose-600">{stats.wrongCount}</div>
            <div className="text-[10px] text-rose-700 font-semibold">오답</div>
          </div>
        </div>
      </div>

      {/* Chapter Breakdown */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-700 px-1">과목별 취약도 및 정답률</div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
          {stats.chapterList.map(ch => (
            <div key={ch.chapter} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-800 truncate pr-2">{ch.chapter}</span>
                <span className="font-black text-slate-600 shrink-0">
                  {ch.solved > 0 ? `${ch.rate}%` : '-'}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    ({ch.solved}/{ch.total})
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    ch.rate >= 70
                      ? 'bg-emerald-500'
                      : ch.rate >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${ch.solved > 0 ? ch.rate : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <button
          onClick={handleClearHistory}
          className="w-full py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>학습 기록 전체 초기화</span>
        </button>
      </div>
    </div>
  );
};
