'use client';

import { ActivityType, DailyLog } from '@/lib/types';
import { formatDate, isSameDay } from '@/lib/utils';
import DayActivityCard from './DayActivityCard';
import UserAvatar from './UserAvatar';

interface StreakComparisonProps {
  users: Array<{ userId: string; name: string; streak: number }>;
  currentWeek: Date[];
  logs: DailyLog[];
  currentUserId: string;
}

export default function StreakComparison({
  users,
  currentWeek,
  logs,
  currentUserId,
}: StreakComparisonProps) {
  const getActivityForDate = (userId: string, date: Date): ActivityType | null => {
    const dateStr = formatDate(date);
    const log = logs.find(
      (log) => log.user_id === userId && log.date === dateStr
    );
    
    if (!log || !log.activity || log.activity.length === 0) {
      return null;
    }
    
    // Return the last activity if multiple, or the only one
    return log.activity[log.activity.length - 1] as ActivityType;
  };

  return (
    <div className="space-y-6">
      {users.map((user) => (
        <div key={user.userId} className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
          {/* User Header */}
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar name={user.name} size="md" />
            <div className="flex-1">
              <div className="text-white font-semibold capitalize">{user.name}</div>
              <div className="text-xs text-green-400">
                ✓ {user.streak} hari aktif minggu ini
              </div>
            </div>
            {user.userId === currentUserId && (
              <div className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                Kamu
              </div>
            )}
          </div>

          {/* Weekly Activities Grid */}
          <div className="grid grid-cols-7 gap-2">
            {currentWeek.map((date) => (
              <DayActivityCard
                key={date.toISOString()}
                date={date}
                activity={getActivityForDate(user.userId, date)}
                isToday={isSameDay(date, new Date())}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
