import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { ExamListScreen } from './screens/ExamListScreen';
import { ChapterScreen } from './screens/ChapterScreen';
import { WrongNotesScreen } from './screens/WrongNotesScreen';
import { StatsScreen } from './screens/StatsScreen';
import { QuizScreen } from './screens/QuizScreen';
import type { Question, StudyMode, UserRecord } from './types';
import { getAllRecords } from './utils/storage';
import rawQuestionsData from './data/questions_db.json';

export const App: React.FC = () => {
  const questions: Question[] = rawQuestionsData as Question[];

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentScreen, setCurrentScreen] = useState<'tab' | 'quiz'>('tab');
  const [studyMode, setStudyMode] = useState<StudyMode>('exam');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizInitialIndex, setQuizInitialIndex] = useState<number>(0);

  // R2: 시험 타이머
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

  // 사용자 기록 상태
  const [userRecords, setUserRecords] = useState<Record<string, UserRecord>>({});

  useEffect(() => {
    setUserRecords(getAllRecords());
  }, []);

  // 타이머 카운트다운
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0 || currentScreen !== 'quiz') return;

    const timer = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerSeconds, currentScreen]);

  // 홈 화면 통계 데이터 계산
  const homeStats = useMemo(() => {
    let solvedCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let bookmarkCount = 0;

    Object.values(userRecords).forEach(rec => {
      if (rec.attemptCount > 0) {
        solvedCount++;
        if (rec.lastResult === 'correct') correctCount++;
      }
      if (rec.wrongCount > 0) wrongCount++;
      if (rec.bookmarked) bookmarkCount++;
    });

    const correctRate = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;

    return {
      solvedCount,
      correctRate,
      wrongCount,
      bookmarkCount
    };
  }, [userRecords]);

  // 퀴즈 시작 핸들러
  const handleStartQuiz = (
    list: Question[],
    title: string,
    initialIdx: number = 0,
    enableTimer: boolean = false
  ) => {
    if (list.length === 0) {
      alert('출제할 수 있는 문제가 없습니다.');
      return;
    }
    setQuizQuestions(list);
    setQuizTitle(title);
    setQuizInitialIndex(initialIdx);
    setTimerSeconds(enableTimer ? list.length * 180 : null);
    setCurrentScreen('quiz');
  };

  // 연도·회차별 풀기
  const handleSelectExamRound = (year: number, round: number) => {
    const roundQuestions = questions.filter(q => q.year === year && q.round === round);
    handleStartQuiz(
      roundQuestions,
      `${year}년 제${round}회 실기`,
      0,
      studyMode === 'exam'
    );
  };

  // 단원별 풀기
  const handleSelectChapter = (chapter: string) => {
    const chapterQuestions = questions.filter(q => q.chapter === chapter);
    handleStartQuiz(
      chapterQuestions,
      chapter,
      0,
      false
    );
  };

  // 빈출 풀기
  const handleSelectFrequency = (minFreq: number) => {
    const freqQuestions = questions.filter(q => q.frequency >= minFreq);
    handleStartQuiz(
      freqQuestions,
      `${minFreq}회 이상 빈출 기출`,
      0,
      false
    );
  };

  // 오답 모의고사 시작
  const handleStartWrongQuiz = () => {
    const wrongList = questions
      .filter(q => (userRecords[q.id]?.wrongCount || 0) > 0)
      .sort(() => Math.random() - 0.5);
    handleStartQuiz(
      wrongList,
      '오답 무작위 모의고사',
      0,
      studyMode === 'exam'
    );
  };

  // 홈에서 빠른 시작
  const handleHomeQuickStart = (
    type: 'exam_round' | 'random' | 'wrong' | 'freq' | 'bookmark',
    param?: any
  ) => {
    if (type === 'exam_round') {
      handleSelectExamRound(param.year, param.round);
    } else if (type === 'random') {
      const count = param?.count || 20;
      const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, count);
      handleStartQuiz(shuffled, `랜덤 모의고사 (${count}문항)`, 0, studyMode === 'exam');
    } else if (type === 'wrong') {
      handleStartWrongQuiz();
    } else if (type === 'freq') {
      handleSelectFrequency(3);
    } else if (type === 'bookmark') {
      const bList = questions.filter(q => userRecords[q.id]?.bookmarked);
      handleStartQuiz(bList, '북마크 문항 풀이', 0, false);
    }
  };

  // 개별 문항 선택 진입
  const handleSelectSingleQuestion = (questionId: string) => {
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx >= 0) {
      handleStartQuiz(questions, '문제 풀이', idx, false);
    }
  };

  return (
    <div className="mobile-container">
      {/* Top Header */}
      <Header
        title={currentScreen === 'quiz' ? quizTitle : '건축기사 실기 마스터'}
        showBack={currentScreen === 'quiz'}
        onBack={() => setCurrentScreen('tab')}
        timerSeconds={currentScreen === 'quiz' ? timerSeconds : null}
      />

      {/* Screen Routing */}
      {currentScreen === 'quiz' ? (
        <QuizScreen
          questions={quizQuestions}
          studyMode={studyMode}
          initialIndex={quizInitialIndex}
          userRecords={userRecords}
          onUpdateRecords={setUserRecords}
          onFinishQuiz={() => setCurrentScreen('tab')}
        />
      ) : (
        <>
          {activeTab === 'home' && (
            <HomeScreen
              studyMode={studyMode}
              onToggleStudyMode={setStudyMode}
              onStartExam={handleHomeQuickStart}
              totalQuestions={questions.length}
              solvedCount={homeStats.solvedCount}
              correctRate={homeStats.correctRate}
              wrongCount={homeStats.wrongCount}
              bookmarkCount={homeStats.bookmarkCount}
            />
          )}
          {activeTab === 'exams' && (
            <ExamListScreen
              questions={questions}
              userRecords={userRecords}
              onSelectExamRound={handleSelectExamRound}
            />
          )}
          {activeTab === 'chapters' && (
            <ChapterScreen
              questions={questions}
              userRecords={userRecords}
              onSelectChapter={handleSelectChapter}
              onSelectFrequency={handleSelectFrequency}
            />
          )}
          {activeTab === 'wrong' && (
            <WrongNotesScreen
              questions={questions}
              userRecords={userRecords}
              onStartWrongQuiz={handleStartWrongQuiz}
              onSelectQuestion={handleSelectSingleQuestion}
            />
          )}
          {activeTab === 'stats' && (
            <StatsScreen
              questions={questions}
              userRecords={userRecords}
              onResetData={() => setUserRecords({})}
            />
          )}

          {/* Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            wrongCount={homeStats.wrongCount}
          />
        </>
      )}
    </div>
  );
};

export default App;
