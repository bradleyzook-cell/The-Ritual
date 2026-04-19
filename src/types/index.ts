export type TaskId =
  | 'wake_up'
  | 'workout'
  | 'water'
  | 'family_time'
  | 'financial'
  | 'diet'
  | 'journal'
  | 'no_substances';

export interface Task {
  id: TaskId;
  title: string;
  description: string;
  icon: string;
}

export interface DayLog {
  date: string; // 'YYYY-MM-DD'
  completedTasks: Partial<Record<TaskId, boolean>>;
  isComplete: boolean;
}

export interface UserSettings {
  name: string;
  wakeTime: string; // 'HH:MM' 24-hour
  startDate: string; // 'YYYY-MM-DD'
}

export interface RitualData {
  settings: UserSettings;
  days: Record<string, DayLog>;
  hasOnboarded?: boolean;
  totalStarts?: number;
  successfulRuns?: number;
  bestDaysEver?: number;
}

export interface RitualContextType {
  data: RitualData | null;
  loading: boolean;
  toggleTask: (taskId: TaskId) => Promise<void>;
  toggleTaskForDate: (date: string, taskId: TaskId) => Promise<void>;
  completeDay: (date: string) => Promise<void>;
  completeOnboarding: (name: string, wakeTime: string) => Promise<void>;
  restartRitual: () => Promise<void>;
  saveSettings: (settings: UserSettings) => Promise<void>;
  resetData: () => Promise<void>;
  currentStreak: number;
  bestStreak: number;
  totalCompleteDays: number;
  dayNumber: number;
  todayProgress: { completed: number; total: number };
  isTodayComplete: boolean;
  badgesEarned: number;
  nextBadge: { checkpoint: number; date: string } | null;
  completionRate: number;
  bestDaysEver: number;
}
