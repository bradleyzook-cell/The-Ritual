import { Task } from '../types';

export const TASKS: Task[] = [
  {
    id: 'wake_up',
    title: 'Wake Up on Time',
    description: 'Rise at your set time — no snoozing',
    icon: '🌅',
  },
  {
    id: 'workout',
    title: '40-Minute Workout',
    description: 'Intentional physical training',
    icon: '💪',
  },
  {
    id: 'water',
    title: 'Drink 100 oz of Water',
    description: 'Stay hydrated throughout the day',
    icon: '💧',
  },
  {
    id: 'family_time',
    title: 'Quality Family Time',
    description: 'Be fully present with the people who matter',
    icon: '❤️',
  },
  {
    id: 'financial',
    title: 'Financial Touchpoint',
    description: 'Review, track, or improve your finances',
    icon: '💰',
  },
  {
    id: 'diet',
    title: 'Ingredient-Based Diet',
    description: "Eat whole, real foods — know what's in your meals",
    icon: '🥗',
  },
  {
    id: 'journal',
    title: 'Intentional Journaling',
    description: 'Reflect, plan, and grow through writing',
    icon: '📓',
  },
  {
    id: 'no_substances',
    title: 'No Drugs or Alcohol',
    description: 'Stay clean — clarity is a superpower',
    icon: '🚫',
  },
];

export const TASK_IDS = TASKS.map((t) => t.id);
export const TOTAL_TASKS = TASKS.length;
