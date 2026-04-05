import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { RitualContextType, RitualData, TaskId, UserSettings } from '../types';
import {
  loadData,
  toggleTaskInStorage,
  completeDayInStorage,
  completeOnboardingInStorage,
  updateSettingsInStorage,
  resetAllData,
} from '../utils/storage';
import {
  getTodayString,
  subtractDays,
  getDaysBetween,
} from '../utils/dateUtils';
import { TASK_IDS, TOTAL_TASKS } from '../constants/tasks';

const RitualContext = createContext<RitualContextType | null>(null);

export function RitualProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RitualData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const toggleTask = useCallback(async (taskId: TaskId) => {
    const updated = await toggleTaskInStorage(getTodayString(), taskId, TASK_IDS);
    setData(updated);
  }, []);

  const toggleTaskForDate = useCallback(async (date: string, taskId: TaskId) => {
    const updated = await toggleTaskInStorage(date, taskId, TASK_IDS);
    setData(updated);
  }, []);

  const completeDay = useCallback(async (date: string) => {
    const updated = await completeDayInStorage(date, TASK_IDS);
    setData(updated);
  }, []);

  const completeOnboarding = useCallback(async (name: string, wakeTime: string) => {
    const updated = await completeOnboardingInStorage(name, wakeTime);
    setData(updated);
  }, []);

  const saveSettings = useCallback(async (settings: UserSettings) => {
    const updated = await updateSettingsInStorage(settings);
    setData(updated);
  }, []);

  const resetData = useCallback(async () => {
    const fresh = await resetAllData();
    setData(fresh);
  }, []);

  const currentStreak = useMemo((): number => {
    if (!data) return 0;
    const today = getTodayString();
    let streak = 0;
    let checkDate = today;

    // Count today if complete, then walk back
    if (data.days[checkDate]?.isComplete) {
      streak = 1;
      checkDate = subtractDays(checkDate, 1);
    } else {
      checkDate = subtractDays(checkDate, 1);
    }

    for (let i = 0; i < 10000; i++) {
      if (data.days[checkDate]?.isComplete) {
        streak++;
        checkDate = subtractDays(checkDate, 1);
      } else {
        break;
      }
    }
    return streak;
  }, [data]);

  const bestStreak = useMemo((): number => {
    if (!data) return 0;
    const sortedDates = Object.keys(data.days).sort();
    let best = 0;
    let current = 0;
    let prev: string | null = null;

    for (const date of sortedDates) {
      if (data.days[date].isComplete) {
        if (prev !== null && getDaysBetween(prev, date) === 1) {
          current++;
        } else {
          current = 1;
        }
        prev = date;
        if (current > best) best = current;
      } else {
        prev = null;
        current = 0;
      }
    }
    return best;
  }, [data]);

  const totalCompleteDays = useMemo((): number => {
    if (!data) return 0;
    return Object.values(data.days).filter((d) => d.isComplete).length;
  }, [data]);

  // Day number is streak-based: miss a day = back to Day 1
  const dayNumber = useMemo((): number => {
    if (!data) return 1;
    const today = getTodayString();
    const todayDone = !!data.days[today]?.isComplete;
    // If today is complete, you're on that streak day
    // If today is in progress, you're working toward streak + 1
    return Math.max(1, todayDone ? currentStreak : currentStreak + 1);
  }, [data, currentStreak]);

  const todayProgress = useMemo((): { completed: number; total: number } => {
    if (!data) return { completed: 0, total: TOTAL_TASKS };
    const today = getTodayString();
    const log = data.days[today];
    if (!log) return { completed: 0, total: TOTAL_TASKS };
    const completed = TASK_IDS.filter((id) => !!log.completedTasks[id]).length;
    return { completed, total: TOTAL_TASKS };
  }, [data]);

  const isTodayComplete = useMemo((): boolean => {
    if (!data) return false;
    return !!data.days[getTodayString()]?.isComplete;
  }, [data]);

  const value: RitualContextType = {
    data,
    loading,
    toggleTask,
    toggleTaskForDate,
    completeDay,
    completeOnboarding,
    saveSettings,
    resetData,
    currentStreak,
    bestStreak,
    totalCompleteDays,
    dayNumber,
    todayProgress,
    isTodayComplete,
  };

  return (
    <RitualContext.Provider value={value}>{children}</RitualContext.Provider>
  );
}

export function useRitual(): RitualContextType {
  const ctx = useContext(RitualContext);
  if (!ctx) throw new Error('useRitual must be used within RitualProvider');
  return ctx;
}
