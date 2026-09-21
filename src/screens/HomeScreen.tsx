import React from 'react';
import { Play, Shuffle, AlertOctagon, Sparkles, BookmarkCheck, Flame } from 'lucide-react';
import type { StudyMode } from '../types';

interface HomeScreenProps {
  studyMode: StudyMode;
  onToggleStudyMode: (mode: StudyMode) => void;
  onStartExam: (type: 'exam_round' | 'random' | 'wrong' | 'freq' | 'bookmark', param?: any) => void;
  totalQuestions: number;
  solvedCount: number;
  correctRate: number;
  wrongCount: number;
  bookmarkCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  studyMode,
  onToggleStudyMode,
  onStartExam,
  totalQuestions,
  solvedCount,
  correctRate,
  wrongCount,
  bookmarkCount
}) => {
  return (
    <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
      {/* App Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold mb-1">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>건축기사 실기 스마트 패스</span>
        </div>
        <h2 className="text-xl font-black tracking-tight mb-2">
          건축기사 실기 기출문제
        </h2>
        <p className="text-blue-100 text-xs leading-relaxed">
          2018~2025년 669개 전체 기출문제 및 14개년 단원·빈출 키워드 기반 정밀 채점
        </p>

        {/* Quick Stats Bar */}
        <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-black">{solvedCount} / {totalQuestions}</div>
            <div className="text-[10px] text-blue-200">풀이 문항</div>
          </div>
          <div>
            <div className="text-lg font-black text-amber-300">{correctRate}%</div>
            <div className="text-[10px] text-blue-200">정답률</div>
          </div>
          <div>
            <div className="text-lg font-black text-rose-300">{wrongCount}</div>
            <div className="text-[10px] text-blue-200">오답 복습</div>
          </div>
        </div>
      </div>

      {/* Mode Selector Toggle */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">풀이 모드 선택</span>
          <span className="text-[11px] text-slate-400">언제든 변경 가능</span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => onToggleStudyMode('answer')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              studyMode === 'answer'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>💡</span>
            <span>정답 모드 (암기용)</span>
          </button>
          <button
            onClick={() => onToggleStudyMode('exam')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              studyMode === 'exam'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>✍️</span>
            <span>일반 모드 (시험용)</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 px-1">
          {studyMode === 'answer'
            ? '• 문제 화면에서 [정답 보기]를 눌러 키워드와 해설을 바로 확인하며 암기합니다.'
            : '• 답안을 직접 입력한 뒤 [제출 및 채점]을 눌러 키워드 기반 자동 채점을 받습니다.'}
        </p>
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-700 px-1">빠른 학습 시작</div>

        {/* 1. 최신 기출 바로풀기 */}
        <button
          onClick={() => onStartExam('exam_round', { year: 2025, round: 3 })}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.99] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Play className="w-5 h-5 fill-blue-600" />
            </div>
            <div>
              <div className="text-xs text-blue-600 font-bold">가장 최신 기출</div>
              <div className="text-sm font-black text-slate-800">2025년 제3회 실기 풀기</div>
              <div className="text-[11px] text-slate-400">총 24문항 (100점 만점)</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">시작</span>
        </button>

        {/* 2. 빈출 핵심 문제 (3회 이상) */}
        <button
          onClick={() => onStartExam('freq')}
          className="w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.99] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold shadow-sm">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-amber-700 font-bold">합격 보증 w-key</span>
                <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">★★★</span>
              </div>
              <div className="text-sm font-black text-slate-800">3회 이상 반복 출제 빈출 80제</div>
              <div className="text-[11px] text-amber-800/80">시험 전 무조건 다 맞아야 하는 문제</div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-200/70 px-2.5 py-1 rounded-full">풀기</span>
        </button>

        {/* 3. 랜덤 모의고사 */}
        <button
          onClick={() => onStartExam('random', { count: 20 })}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.99] transition"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-purple-600 font-bold">실전 감각 극대화</div>
              <div className="text-sm font-black text-slate-800">랜덤 모의고사 (20문항)</div>
              <div className="text-[11px] text-slate-400">전체 669문항 풀에서 무작위 출제</div>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">시작</span>
        </button>

        {/* 4. 오답 랜덤 모의고사 */}
        <button
          onClick={() => onStartExam('wrong')}
          disabled={wrongCount === 0}
          className={`w-full border rounded-2xl p-4 flex items-center justify-between text-left shadow-sm transition active:scale-[0.99] ${
            wrongCount > 0
              ? 'bg-white hover:bg-rose-50/50 border-rose-200'
              : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
              wrongCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${wrongCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                취약점 집중 공략
              </div>
              <div className="text-sm font-black text-slate-800">오답 전용 모의고사</div>
              <div className="text-[11px] text-slate-400">
                {wrongCount > 0 ? `틀린 문제 ${wrongCount}개에서 출제` : '현재 틀린 문제가 없습니다'}
              </div>
            </div>
          </div>
          {wrongCount > 0 && (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              {wrongCount}제
            </span>
          )}
        </button>

        {/* 5. 북마크 모아보기 */}
        {bookmarkCount > 0 && (
          <button
            onClick={() => onStartExam('bookmark')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.99] transition"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-amber-600 font-bold">저장한 문제</div>
                <div className="text-sm font-black text-slate-800">북마크 문제 풀기</div>
                <div className="text-[11px] text-slate-400">총 {bookmarkCount}개 보관 중</div>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">풀기</span>
          </button>
        )}
      </div>
    </div>
  );
};
