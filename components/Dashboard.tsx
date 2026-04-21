'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { DailyLog, ActivityType, ACTIVITIES } from '@/lib/types';
import { getWeekDates, formatDate, isSameDay } from '@/lib/utils';
import ActivityButton from './ActivityButton';
import StreakComparison from './StreakComparison';
import CalendarHistory from './CalendarHistory';
import UserAvatar from './UserAvatar';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [todayActivities, setTodayActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setCurrentWeek(getWeekDates());
    fetchLogs();
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    const { data } = await supabase.from('mst_users').select('id, name');
    if (data) setAllUsers(data);
  };

  const fetchLogs = async () => {
    if (!user) return;

    const weekDates = getWeekDates();
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);

    const { data, error } = await supabase
      .from('mst_daily_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
      
      // Get today's activities for current user
      const today = formatDate(new Date());
      const todayLog = data?.find(
        (log) => log.date === today && log.user_id === user.id
      );
      setTodayActivities((todayLog?.activity || []) as ActivityType[]);
    }

    setLoading(false);
  };

  const toggleActivity = async (activity: ActivityType) => {
    if (!user) return;

    const today = formatDate(new Date());
    let newActivities: ActivityType[];

    if (todayActivities.includes(activity)) {
      newActivities = todayActivities.filter((a) => a !== activity);
    } else {
      newActivities = [...todayActivities, activity];
    }

    setTodayActivities(newActivities);

    // Check if log exists for today
    const existingLog = logs.find(
      (log) => log.date === today && log.user_id === user.id
    );

    if (existingLog) {
      // Update existing log - only for current user
      const { error } = await supabase
        .from('mst_daily_logs')
        .update({ activity: newActivities })
        .eq('id', existingLog.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating log:', error);
        setTodayActivities(todayActivities); // Revert on error
      } else {
        fetchLogs(); // Refresh logs
      }
    } else {
      // Create new log
      const { error } = await supabase
        .from('mst_daily_logs')
        .insert([
          {
            date: today,
            activity: newActivities,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.error('Error creating log:', error);
        setTodayActivities(todayActivities); // Revert on error
      } else {
        fetchLogs(); // Refresh logs
      }
    }
  };

  const getUserStreakForWeek = (userId: string) => {
    return logs.filter(
      (log) => log.user_id === userId && log.activity && log.activity.length > 0
    ).length;
  };

  const hasActivityOnDate = (userId: string, date: Date) => {
    const dateStr = formatDate(date);
    return logs.some(
      (log) =>
        log.user_id === userId &&
        log.date === dateStr &&
        log.activity &&
        log.activity.length > 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.name || ''} size="md" />
            <div>
              <div className="text-white font-semibold capitalize">{user?.name}</div>
              <div className="text-xs text-zinc-400">
                {getUserStreakForWeek(user?.id || '')} hari minggu ini
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Today's Activities */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">Aktivitas Hari Ini</h2>
          <div className="grid grid-cols-3 gap-3">
            {ACTIVITIES.map((activity) => (
              <ActivityButton
                key={activity}
                activity={activity}
                isSelected={todayActivities.includes(activity)}
                onClick={() => toggleActivity(activity)}
              />
            ))}
          </div>
          {todayActivities.length > 0 && (
            <div className="mt-4 text-center text-sm text-green-400 bg-green-500/10 py-2 rounded-lg border border-green-500/20">
              Keren! {todayActivities.length} aktivitas hari ini 🔥
            </div>
          )}
        </div>

        {/* Streak Comparison */}
        <StreakComparison
          users={allUsers.map(u => ({
            userId: u.id,
            name: u.name,
            streak: getUserStreakForWeek(u.id)
          }))}
          currentWeek={currentWeek}
          logs={logs}
          currentUserId={user?.id || ''}
        />

        {/* History Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors border border-zinc-800"
        >
          {showHistory ? '📊 Sembunyikan Riwayat' : '📅 Lihat Riwayat'}
        </button>

        {showHistory && (
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">Riwayat</h2>
            <CalendarHistory logs={logs} userId={user?.id || ''} />
          </div>
        )}
      </div>
    </div>
  );
}
