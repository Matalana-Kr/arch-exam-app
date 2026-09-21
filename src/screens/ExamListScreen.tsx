import React, { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import type { Question, UserRecord } from '../types';

interface ExamListScreenProps {
  questions: Question[];
  userRecords: Record<string, UserRecord>;
  onSelectExamRound: (year: number, round: number) => void;
}

export const ExamListScreen: React.FC<ExamListScreenProps> = ({
  questions,
  userRecords,
  onSelectExamRound
}) => {
  // 연도/회차 목록 구성
  const examGroups = React.useMemo(() => {
    const map = new Map<number, Set<number>>();
    questions.forEach(q => {
      if (!map.has(q.year)) {
        map.set(q.year, new Set<number>());
      }
      map.get(q.year)!.add(q.round);
    });

    const years = Array.from(map.keys()).sort((a, b) => b - a);
    return years.map(year => ({
      year,
      rounds: Array.from(map.get(year)!).sort((a, b) => a - b)
    }));
  }, [questions]);

  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const getRoundStats = (year: number, round: number) => {
    const roundQuestions = questions.filter(q => q.year === year && q.round === round);
    const totalCount = roundQuestions.length;
    let solvedCount = 0;
    let earnedPoints = 0;
    let maxPoints = 0;

    roundQuestions.forEach(q => {
      maxPoints += q.points;
      const rec = userRecords[q.id];
      if (rec && rec.attemptCount > 0) {
        solvedCount++;
        earnedPoints += rec.lastEarnedPoints;
      }
    });

    return {
      totalCount,
      solvedCount,
      earnedPoints,
      maxPoints,
      isCompleted: solvedCount === totalCount && totalCount > 0
    };
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      <div>
        <h2 className="text-base font-black text-slate-800">연도·회차별 기출문제</h2>
        <p className="text-xs text-slate-500">2018년부터 2025년까지 총 26개 시험지</p>
      </div>

      {/* Year Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {examGroups.map(g => (
          <button
            key={g.year}
            onClick={() => setSelectedYear(g.year)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
              selectedYear === g.year
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {g.year}년
          </button>
        ))}
      </div>

      {/* Round Cards */}
      <div className="space-y-2.5">
        {examGroups
          .find(g => g.year === selectedYear)
          ?.rounds.map(round => {
            const stats = getRoundStats(selectedYear, round);
            return (
              <button
                key={round}
                onClick={() => onSelectExamRound(selectedYear, round)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.99] transition"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${
                    stats.isCompleted
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : stats.solvedCount > 0
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className="text-[10px] font-bold">제</span>
                    <span className="text-base leading-none">{round}회</span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-slate-800">
                        {selectedYear}년 제{round}회 실기
                      </span>
                      {stats.isCompleted && (
                        <span className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 mr-0.5" /> 완료
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                      <span>총 {stats.totalCount}문항 ({stats.maxPoints}점 만점)</span>
                      {stats.solvedCount > 0 && (
                        <span className="text-blue-600 font-medium">
                          진행 {stats.solvedCount}/{stats.totalCount} ({stats.earnedPoints}점)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
