import React from 'react';
import { Home, Calendar, Layers, AlertCircle, BarChart3 } from 'lucide-react';

export type TabType = 'home' | 'exams' | 'chapters' | 'wrong' | 'stats';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  wrongCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  wrongCount = 0
}) => {
  const navItems = [
    { id: 'home' as TabType, label: '홈', icon: Home },
    { id: 'exams' as TabType, label: '회차별', icon: Calendar },
    { id: 'chapters' as TabType, label: '단원·빈출', icon: Layers },
    { id: 'wrong' as TabType, label: '오답노트', icon: AlertCircle, badge: wrongCount > 0 ? wrongCount : undefined },
    { id: 'stats' as TabType, label: '통계', icon: BarChart3 },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl relative transition-all active:scale-95 ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
