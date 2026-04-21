'use client';

import { getDayName } from '@/lib/utils';

interface DayCardProps {
  date: Date;
  hasActivity: boolean;
  isToday: boolean;
}

export default function DayCard({ date, hasActivity, isToday }: DayCardProps) {
  return (
    <div
      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
        isToday
          ? 'bg-blue-600/20 border border-blue-500/50 ring-2 ring-blue-500/20'
          : 'bg-zinc-900/50 border border-zinc-800'
      }`}
    >
      <div className={`text-xs mb-2 ${isToday ? 'text-blue-400' : 'text-zinc-500'}`}>
        {getDayName(date)}
      </div>
      <div className={`text-lg font-semibold mb-2 ${isToday ? 'text-white' : 'text-zinc-300'}`}>
        {date.getDate()}
      </div>
      <div className="flex items-center justify-center">
        {hasActivity ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30">
            ✓
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800/50 border border-zinc-700"></div>
        )}
      </div>
    </div>
  );
}
