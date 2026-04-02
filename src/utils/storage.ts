import AsyncStorage from '@react-native-async-storage/async-storage';
import { RitualData, DayLog, UserSettings, TaskId } from '../types';
import { getTodayString } from './dateUtils';

const STORAGE_KEY = '@ritual_v1';

export function getDefaultData(): RitualData {
  return {
    settings: {
      name: '',
      wakeTime: '06:00',
      startDate: getTodayString(),
    },
    days: {},
  };
}

export async function loadData(): Promise<RitualData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as RitualData;
  } catch {
    return getDefaultData();
  }
}

export async function saveData(data: RitualData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save ritual data:', e);
  }
}

export async function toggleTaskInStorage(
  date: string,
  taskId: TaskId,
  allTaskIds: TaskId[]
): Promise<RitualData> {
  const data = await loadData();
  const existing: DayLog = data.days[date] ?? {
    date,
    completedTasks: {},
    isComplete: false,
  };

  const newCompleted: Partial<Record<TaskId, boolean>> = {
    ...existing.completedTasks,
    [taskId]: !existing.completedTasks[taskId],
  };

  const isComplete = allTaskIds.every((id) => !!newCompleted[id]);

  const updated: RitualData = {
    ...data,
    days: {
      ...data.days,
      [date]: { date, completedTasks: newCompleted, isComplete },
    },
  };

  await saveData(updated);
  return updated;
}

export async function updateSettingsInStorage(
  settings: UserSettings
): Promise<RitualData> {
  const data = await loadData();
  const updated = { ...data, settings };
  await saveData(updated);
  return updated;
}

export async function resetAllData(): Promise<RitualData> {
  const fresh = getDefaultData();
  await saveData(fresh);
  return fresh;
}
