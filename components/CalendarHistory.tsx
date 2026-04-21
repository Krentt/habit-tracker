'use client';

import { useState } from 'react';
import { ActivityType, DailyLog } from '@/lib/types';
import { formatDate, getMonthYear } from '@/lib/utils';
import ActivityIcon from './ActivityIcon';

interface CalendarHistoryProps {
  logs: DailyLog[];
  userId: string;
}

export default function CalendarHistory({ logs, userId }: CalendarHistoryProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getActivityForDate = (date: Date): ActivityType | null => {
    const dateStr = formatDate(date);
    const log = logs.find(
      (log) => log.user_id === userId && log.date === dateStr
    );

    if (!log || !log.activity || log.activity.length === 0) {
      return null;
    }

    return log.activity[log.activity.length - 1] as ActivityType;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors"
        >
          ← Bulan Sebelumnya
        </button>
        <h3 className="text-lg font-bold text-white">
          {getMonthYear(currentDate)}
        </h3>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors"
        >
          Bulan Berikutnya →
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-zinc-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const activity = date ? getActivityForDate(date) : null;

          return (
            <div
              key={index}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all ${
                date
                  ? 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'
                  : 'bg-transparent'
              }`}
            >
              {date && (
                <>
                  <div className="text-xs font-semibold text-zinc-400 mb-1">
                    {date.getDate()}
                  </div>
                  {activity ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <ActivityIcon
                        activity={activity}
                        size="sm"
                        isSelected={true}
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-zinc-800/30 border border-zinc-700/50"></div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
