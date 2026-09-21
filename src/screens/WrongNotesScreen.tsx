import React from 'react';
import { AlertOctagon, Play, CheckCircle, ChevronRight } from 'lucide-react';
import type { Question, UserRecord } from '../types';

interface WrongNotesScreenProps {
  questions: Question[];
  userRecords: Record<string, UserRecord>;
  onStartWrongQuiz: () => void;
  onSelectQuestion: (questionId: string) => void;
}

export const WrongNotesScreen: React.FC<WrongNotesScreenProps> = ({
  questions,
  userRecords,
  onStartWrongQuiz,
  onSelectQuestion
}) => {
  const wrongQuestions = questions.filter(q => {
    const rec = userRecords[q.id];
    return rec && rec.wrongCount > 0;
  }).sort((a, b) => {
    const wA = userRecords[a.id]?.wrongCount || 0;
    const wB = userRecords[b.id]?.wrongCount || 0;
    return wB - wA;
  });

  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center space-x-2 text-rose-100 text-xs font-semibold mb-1">
          <AlertOctagon className="w-4 h-4" />
          <span>오답 반복 트레이닝</span>
        </div>
        <h2 className="text-lg font-black tracking-tight mb-1">
          오답 복습 노트 ({wrongQuestions.length}문항)
        </h2>
        <p className="text-rose-100 text-xs leading-relaxed">
          실기 시험의 핵심은 틀린 문제를 확실히 내 것으로 만드는 것입니다.
        </p>

        {wrongQuestions.length > 0 && (
          <button
            onClick={onStartWrongQuiz}
            className="mt-3 w-full py-2.5 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-black shadow-sm active:scale-[0.99] transition flex items-center justify-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-rose-600" />
            <span>오답 전용 무작위 모의고사 시작</span>
          </button>
        )}
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">틀린 문제가 없습니다!</h3>
            <p className="text-xs text-slate-400 mt-1">
              문제를 풀고 틀린 문항이 발생하면 이곳에 자동으로 누적됩니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-700 px-1">자주 틀리는 취약 문항</div>
          {wrongQuestions.map(q => {
            const rec = userRecords[q.id];
            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(q.id)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      {rec.wrongCount}회 오답
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {q.year}년 {q.round}회 #{q.number}
                    </span>
                    <span className="text-xs text-slate-400">({q.points}점)</span>
                    {q.has_image && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                        도면
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                  {q.question_text}
                </div>

                {rec.lastAnswer && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg truncate">
                    <span className="font-semibold text-rose-500 mr-1">내 오답:</span>
                    {rec.lastAnswer}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
