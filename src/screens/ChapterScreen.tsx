import React, { useState, useMemo } from 'react';
import { Layers, Flame, ChevronRight } from 'lucide-react';
import type { Question, UserRecord } from '../types';

interface ChapterScreenProps {
  questions: Question[];
  userRecords: Record<string, UserRecord>;
  onSelectChapter: (chapter: string) => void;
  onSelectFrequency: (minFreq: number) => void;
}

export const ChapterScreen: React.FC<ChapterScreenProps> = ({
  questions,
  userRecords,
  onSelectChapter,
  onSelectFrequency
}) => {
  const [activeTab, setActiveTab] = useState<'chapter' | 'frequency'>('chapter');

  const chapterStats = useMemo(() => {
    const map = new Map<string, { total: number; solved: number; correct: number }>();
    
    questions.forEach(q => {
      const chap = q.chapter || '기타';
      if (!map.has(chap)) {
        map.set(chap, { total: 0, solved: 0, correct: 0 });
      }
      const stat = map.get(chap)!;
      stat.total++;

      const rec = userRecords[q.id];
      if (rec && rec.attemptCount > 0) {
        stat.solved++;
        if (rec.lastResult === 'correct') {
          stat.correct++;
        }
      }
    });

    return Array.from(map.entries()).map(([chapter, stat]) => ({
      chapter,
      ...stat
    })).sort((a, b) => b.total - a.total);
  }, [questions, userRecords]);

  const freqStats = useMemo(() => {
    const freq3 = questions.filter(q => q.frequency >= 3);
    const freq2 = questions.filter(q => q.frequency === 2);
    
    const countSolved = (list: Question[]) =>
      list.filter(q => userRecords[q.id]?.lastResult === 'correct').length;

    return {
      freq3Count: freq3.length,
      freq3Solved: countSolved(freq3),
      freq2Count: freq2.length,
      freq2Solved: countSolved(freq2),
    };
  }, [questions, userRecords]);

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Tab Switch */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('chapter')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'chapter'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>단원별 학습</span>
        </button>
        <button
          onClick={() => setActiveTab('frequency')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'frequency'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>빈출 핵심 모아보기</span>
        </button>
      </div>

      {activeTab === 'chapter' ? (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-700">과목 및 단원 선택</span>
            <span className="text-[11px] text-slate-400">총 {chapterStats.length}개 과목</span>
          </div>

          {chapterStats.map(item => {
            const percent = item.total > 0 ? Math.round((item.solved / item.total) * 100) : 0;
            return (
              <button
                key={item.chapter}
                onClick={() => onSelectChapter(item.chapter)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-slate-800 truncate pr-2">
                    {item.chapter}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                    {item.total}문항
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                  <span>진행률 {percent}% ({item.solved}/{item.total})</span>
                  <span>정답 {item.correct}개</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-black mb-1 flex items-center space-x-1.5">
              <Flame className="w-4 h-4 fill-white" />
              <span>14개년 기출 빈출 랭킹</span>
            </h3>
            <p className="text-[11px] text-amber-100 leading-relaxed">
              여러 회차에 걸쳐 반복 출제된 기출문제는 실제 시험에서도 다시 나올 확률이 매우 높습니다.
            </p>
          </div>

          {/* 3회 이상 빈출 */}
          <button
            onClick={() => onSelectFrequency(3)}
            className="w-full bg-white hover:bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  ★★★ 3회 이상 출제
                </span>
                <span className="text-xs font-bold text-slate-500">필수 암기</span>
              </div>
              <div className="text-sm font-black text-slate-800 mt-1">
                초특급 빈출 기출문제
              </div>
              <div className="text-xs text-slate-400 mt-1">
                총 {freqStats.freq3Count}문항 (정답 완료: {freqStats.freq3Solved}문항)
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </button>

          {/* 2회 이상 빈출 */}
          <button
            onClick={() => onSelectFrequency(2)}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  ★★ 2회 출제
                </span>
                <span className="text-xs font-bold text-slate-500">주요 빈출</span>
              </div>
              <div className="text-sm font-black text-slate-800 mt-1">
                반복 기출 핵심 문항
              </div>
              <div className="text-xs text-slate-400 mt-1">
                총 {freqStats.freq2Count}문항 (정답 완료: {freqStats.freq2Solved}문항)
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
};
