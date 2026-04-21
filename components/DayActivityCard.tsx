'use client';

import { ActivityType } from '@/lib/types';
import { getDayName } from '@/lib/utils';
import ActivityIcon from './ActivityIcon';

interface DayActivityCardProps {
  date: Date;
  activity: ActivityType | null;
  isToday: boolean;
}

export default function DayActivityCard({ date, activity, isToday }: DayActivityCardProps) {
  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg transition-all ${
        isToday
          ? 'bg-blue-600/20 border border-blue-500/50 ring-2 ring-blue-500/20'
          : 'bg-zinc-900/50 border border-zinc-800'
      }`}
    >
      <div className={`text-xs mb-1 ${isToday ? 'text-blue-400' : 'text-zinc-500'}`}>
        {getDayName(date)}
      </div>
      <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-white' : 'text-zinc-300'}`}>
        {date.getDate()}
      </div>
      <div className="flex items-center justify-center h-8">
        {activity ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <ActivityIcon activity={activity} size="sm" isSelected={true} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800/50 border border-zinc-700"></div>
        )}
      </div>
    </div>
  );
}
