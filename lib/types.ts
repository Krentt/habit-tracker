export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface DailyLog {
  id: number;
  created_at: string;
  date: string;
  activity: string[];
  user_id: string;
}

export type ActivityType = 'Lari' | 'Gym' | 'Pilates' | 'Tennis' | 'Berenang';

export const ACTIVITIES: ActivityType[] = ['Lari', 'Gym', 'Pilates', 'Tennis', 'Berenang'];
