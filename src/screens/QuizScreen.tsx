import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, 
  Eye, ThumbsUp, ThumbsDown, Edit3, Bookmark, Save, ZoomIn, Image as ImageIcon
} from 'lucide-react';
import type { Question, StudyMode, ScoringResult, UserRecord } from '../types';
import { evaluateAnswer } from '../utils/scoring';
import { saveScoringResult, toggleBookmark, saveMemo, setUserOverride } from '../utils/storage';
import { ImageViewerModal } from '../components/ImageViewerModal';

interface QuizScreenProps {
  questions: Question[];
  studyMode: StudyMode;
  initialIndex?: number;
  userRecords: Record<string, UserRecord>;
  onUpdateRecords: (records: Record<string, UserRecord>) => void;
  onFinishQuiz: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  studyMode,
  initialIndex = 0,
  userRecords,
  onUpdateRecords,
  onFinishQuiz
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [memoText, setMemoText] = useState<string>('');
  const [showMemoInput, setShowMemoInput] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  const currentQ = questions[currentIndex];
  const currentRecord = currentQ ? userRecords[currentQ.id] : null;

  useEffect(() => {
    if (!currentQ) return;
    const rec = userRecords[currentQ.id];
    setUserAnswer(rec ? rec.lastAnswer : '');
    setMemoText(rec ? rec.memo : '');
    setShowAnswer(studyMode === 'answer' && !!rec);
    setScoringResult(null);
    setShowMemoInput(false);
  }, [currentIndex, currentQ, studyMode]);

  if (!currentQ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 mb-4">표시할 문제가 없습니다.</p>
        <button
          onClick={onFinishQuiz}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    const res = evaluateAnswer(currentQ, userAnswer);
    setScoringResult(res);
    setShowAnswer(true);

    const updated = saveScoringResult(res, currentRecord?.bookmarked, memoText);
    onUpdateRecords({ ...userRecords, [currentQ.id]: updated });
  };

  const handleAnswerModeMark = (isCorrect: boolean) => {
    const override = isCorrect ? 'correct' : 'wrong';
    const updated = setUserOverride(currentQ.id, override);
    onUpdateRecords({ ...userRecords, [currentQ.id]: updated });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleOverrideScore = (override: 'correct' | 'wrong') => {
    const updated = setUserOverride(currentQ.id, override);
    onUpdateRecords({ ...userRecords, [currentQ.id]: updated });
    if (scoringResult) {
      setScoringResult({
        ...scoringResult,
        userOverride: override,
        isCorrect: override === 'correct',
        earnedPoints: override === 'correct' ? currentQ.points : 0
      });
    }
  };

  const handleBookmarkToggle = () => {
    const newState = toggleBookmark(currentQ.id);
    const existing = userRecords[currentQ.id] || {
      questionId: currentQ.id,
      lastAnswer: '',
      lastEarnedPoints: 0,
      lastResult: 'wrong',
      wrongCount: 0,
      attemptCount: 0,
      lastAttemptDate: new Date().toISOString(),
      bookmarked: newState,
      memo: ''
    };
    onUpdateRecords({
      ...userRecords,
      [currentQ.id]: { ...existing, bookmarked: newState }
    });
  };

  const handleSaveMemo = () => {
    saveMemo(currentQ.id, memoText);
    const existing = userRecords[currentQ.id];
    if (existing) {
      onUpdateRecords({
        ...userRecords,
        [currentQ.id]: { ...existing, memo: memoText }
      });
    }
    setShowMemoInput(false);
  };

  const isBookmarked = currentRecord?.bookmarked || false;

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pb-16 overflow-y-auto space-y-4">
      {/* Top Question Info Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
              {currentQ.year}년 {currentQ.round}회 #{currentQ.number}
            </span>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
              {currentQ.points}점
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              {currentQ.type}
            </span>
            {currentQ.has_image && (
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-lg flex items-center space-x-1">
                <ImageIcon className="w-3 h-3 mr-0.5" />
                <span>도면/표</span>
              </span>
            )}
            {currentQ.frequency >= 2 && (
              <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                currentQ.frequency >= 3
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {currentQ.frequency}회 출제
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowMemoInput(!showMemoInput)}
              className={`p-1.5 rounded-lg transition ${
                currentRecord?.memo ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="메모"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition ${
                isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="북마크"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Question Text Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">
              {currentQ.chapter}
            </span>
            {currentQ.question_image && (
              <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md flex items-center">
                <ZoomIn className="w-3 h-3 mr-1" />
                도면 탭하여 확대
              </span>
            )}
          </div>

          <div className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-line">
            {currentQ.question_text}
          </div>

          {/* Question Visual Image (도면 / 표 / 보기) */}
          {currentQ.question_image && (
            <div 
              onClick={() => setZoomImage({ url: currentQ.question_image!, title: `${currentQ.year}년 ${currentQ.round}회 #${currentQ.number} 문제 도면 및 보기` })}
              className="mt-3 relative group cursor-zoom-in rounded-xl overflow-hidden border border-purple-100 bg-purple-50/30 p-2 hover:border-purple-300 transition"
            >
              <img
                src={currentQ.question_image}
                alt="문제 도면 및 보기"
                className="w-full max-h-72 object-contain rounded-lg bg-white shadow-xs mx-auto"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg transition">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>전체화면 확대보기</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Memo Input Box (Toggleable) */}
        {showMemoInput && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-800">
              <span>나만의 암기 메모</span>
              <button
                onClick={handleSaveMemo}
                className="flex items-center space-x-1 bg-amber-600 text-white px-2 py-0.5 rounded text-[11px]"
              >
                <Save className="w-3 h-3" />
                <span>저장</span>
              </button>
            </div>
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="외우기 위한 꿀팁, 공식, 연상 키워드를 적어두세요..."
              className="w-full text-xs p-2 rounded-lg bg-white border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none h-16"
            />
          </div>
        )}

        {/* Mode-specific Answer Section */}
        {studyMode === 'exam' ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-700">나의 답안 작성</label>
                <span className="text-[11px] text-slate-400">
                  {currentQ.type === '나열(N가지)'
                    ? `요구 개수: ${currentQ.required_count}가지 (줄바꿈으로 구분)`
                    : currentQ.type === '계산'
                      ? '수치와 단위를 정확히 작성'
                      : '핵심 키워드 위주 서술'}
                </span>
              </div>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={
                  currentQ.type === '나열(N가지)'
                    ? '1. 첫 번째 항목\n2. 두 번째 항목\n3. 세 번째 항목'
                    : '정답 및 핵심 내용을 입력하세요...'
                }
                rows={4}
                className="w-full text-sm p-3.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleSubmitAnswer}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold rounded-2xl shadow-sm transition flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>답안 제출 및 키워드 채점</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-md active:scale-[0.99] transition flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>정답 및 해설 바로보기</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAnswerModeMark(true)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-2xl font-black text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>외웠어요 (정답)</span>
                </button>
                <button
                  onClick={() => handleAnswerModeMark(false)}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white rounded-2xl font-black text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>다시 볼래요 (오답)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scoring Result & Explanation View */}
        {showAnswer && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
            {studyMode === 'exam' && scoringResult && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {scoringResult.isCorrect ? (
                      <span className="flex items-center text-emerald-600 text-xs font-black bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 정답
                      </span>
                    ) : scoringResult.isPartial ? (
                      <span className="flex items-center text-amber-600 text-xs font-black bg-amber-50 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" /> 부분 점수
                      </span>
                    ) : (
                      <span className="flex items-center text-rose-600 text-xs font-black bg-rose-50 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> 오답
                      </span>
                    )}
                    <span className="text-sm font-black text-slate-800">
                      {scoringResult.earnedPoints} / {scoringResult.maxPoints}점
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400 mr-1">직접 보정:</span>
                    <button
                      onClick={() => handleOverrideScore('correct')}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                        scoringResult.userOverride === 'correct'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      정답 인정
                    </button>
                    <button
                      onClick={() => handleOverrideScore('wrong')}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                        scoringResult.userOverride === 'wrong'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      오답 처리
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  {scoringResult.feedback}
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600">키워드 인식 현황:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {scoringResult.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                    {scoringResult.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md flex items-center"
                      >
                        ✗ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <span>표준 모범 답안</span>
                </span>
                {currentQ.answer_image && (
                  <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md flex items-center">
                    <ZoomIn className="w-3 h-3 mr-1" />
                    해답 도면 탭하여 확대
                  </span>
                )}
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 leading-relaxed whitespace-pre-line select-text">
                {currentQ.answer_text}
              </div>

              {/* Answer Visual Image (해답 도면 / 공정표 / 수식) */}
              {currentQ.answer_image && (
                <div 
                  onClick={() => setZoomImage({ url: currentQ.answer_image!, title: `${currentQ.year}년 ${currentQ.round}회 #${currentQ.number} 정답 및 해설 도면` })}
                  className="mt-2 relative group cursor-zoom-in rounded-xl overflow-hidden border border-purple-100 bg-purple-50/30 p-2 hover:border-purple-300 transition"
                >
                  <img
                    src={currentQ.answer_image}
                    alt="정답 및 해설 도면"
                    className="w-full max-h-72 object-contain rounded-lg bg-white shadow-xs mx-auto"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg transition">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>해답 도면 확대보기</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {currentQ.keywords.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-600">채점 핵심 키워드 및 동의어:</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentQ.keywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md"
                    >
                      <span className="font-bold">{kw.term}</span>
                      {kw.synonyms.length > 0 && (
                        <span className="text-blue-500 font-normal ml-1">
                          ({kw.synonyms.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {zoomImage && (
        <ImageViewerModal
          imageUrl={zoomImage.url}
          title={zoomImage.title}
          onClose={() => setZoomImage(null)}
        />
      )}

      {/* Bottom Navigation Controls */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur pt-3 pb-1 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            currentIndex === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          {currentIndex + 1} / {questions.length}
        </span>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <span>다음</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onFinishQuiz}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <span>풀이 완료</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
