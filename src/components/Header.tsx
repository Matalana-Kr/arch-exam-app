import React from 'react';
import { ArrowLeft, Clock, Bookmark } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  timerSeconds?: number | null;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  timerSeconds,
  onBookmarkToggle,
  isBookmarked,
  rightAction
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        {showBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 active:scale-95 transition"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base font-bold text-slate-800 truncate max-w-[200px]">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        {timerSeconds !== undefined && timerSeconds !== null && (
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}

        {onBookmarkToggle && (
          <button
            onClick={onBookmarkToggle}
            className={`p-1.5 rounded-full transition active:scale-95 ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="북마크"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        )}

        {rightAction}
      </div>
    </header>
  );
};
