import * as FileSystem from 'expo-file-system';
import { RitualData, DayLog, UserSettings, TaskId } from '../types';
import { getTodayString } from './dateUtils';

const DATA_FILE = FileSystem.documentDirectory + 'ritual_data.json';

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
    const info = await FileSystem.getInfoAsync(DATA_FILE);
    if (!info.exists) return getDefaultData();
    const content = await FileSystem.readAsStringAsync(DATA_FILE);
    return JSON.parse(content) as RitualData;
  } catch {
    return getDefaultData();
  }
}

export async function saveData(data: RitualData): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(DATA_FILE, JSON.stringify(data));
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
