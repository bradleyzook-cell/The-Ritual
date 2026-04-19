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
  restartRitualInStorage,
  updateSettingsInStorage,
  resetAllData,
} from '../utils/storage';
import {
  getTodayString,
  subtractDays,
  getDaysBetween,
  addDays,
  parseDate,
} from '../utils/dateUtils';
import { TASK_IDS, TOTAL_TASKS } from '../constants/tasks';

const RitualContext = createContext<RitualContextType | null>(null);

const BADGE_CHECKPOINTS = [30, 60, 90, 365];
const ALL_CHECKPOINTS = [30, 60, 90, 365];

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

  const restartRitual = useCallback(async () => {
    const updated = await restartRitualInStorage();
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

  // Number of badge checkpoints definitively passed (dayNumber strictly greater)
  const badgesEarned = useMemo((): number => {
    return BADGE_CHECKPOINTS.filter((cp) => dayNumber > cp).length;
  }, [dayNumber]);

  // Next checkpoint not yet passed, with the projected calendar date
  const nextBadge = useMemo((): { checkpoint: number; date: string } | null => {
    const nextCp = ALL_CHECKPOINTS.find((cp) => dayNumber <= cp);
    if (!nextCp) return null;
    const today = getTodayString();
    // daysUntil uses +1 so "day 1 today → day 30 badge on today+30"
    const daysUntil = nextCp - dayNumber + 1;
    const targetDateStr = addDays(today, daysUntil);
    const date = parseDate(targetDateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return { checkpoint: nextCp, date };
  }, [dayNumber]);

  // completionRate = successfulRuns / totalStarts × 100
  const completionRate = useMemo((): number => {
    if (!data) return 0;
    const total = data.totalStarts ?? 1;
    const successful = data.successfulRuns ?? 0;
    return Math.round((successful / total) * 100);
  }, [data]);

  // Best day count ever, persisted across restarts
  const bestDaysEver = useMemo((): number => {
    if (!data) return 0;
    return Math.max(data.bestDaysEver ?? 0, totalCompleteDays);
  }, [data, totalCompleteDays]);

  const value: RitualContextType = {
    data,
    loading,
    toggleTask,
    toggleTaskForDate,
    completeDay,
    completeOnboarding,
    restartRitual,
    saveSettings,
    resetData,
    currentStreak,
    bestStreak,
    totalCompleteDays,
    dayNumber,
    todayProgress,
    isTodayComplete,
    badgesEarned,
    nextBadge,
    completionRate,
    bestDaysEver,
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
