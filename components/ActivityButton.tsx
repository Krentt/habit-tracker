'use client';

import { ActivityType } from '@/lib/types';
import ActivityIcon from './ActivityIcon';

interface ActivityButtonProps {
  activity: ActivityType;
  isSelected: boolean;
  onClick: () => void;
}

const activityColors: Record<ActivityType, string> = {
  Lari: 'from-orange-600 to-red-600',
  Gym: 'from-purple-600 to-pink-600',
  Pilates: 'from-green-600 to-emerald-600',
  Tennis: 'from-yellow-600 to-orange-600',
  Berenang: 'from-blue-600 to-cyan-600',
};

export default function ActivityButton({ activity, isSelected, onClick }: ActivityButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl transition-all duration-200 ${
        isSelected
          ? `bg-gradient-to-br ${activityColors[activity]} shadow-lg scale-105`
          : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:scale-102'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <ActivityIcon activity={activity} size="md" isSelected={isSelected} />
        <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
          {activity}
        </div>
      </div>
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xs font-bold text-green-600">✓</span>
        </div>
      )}
    </button>
  );
}
