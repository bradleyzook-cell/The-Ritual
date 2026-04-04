import { Task } from '../types';

export const TASKS: Task[] = [
  {
    id: 'wake_up',
    title: 'Wake Up At A Set Time',
    description: 'Build routine — rise at the same time every day',
    icon: '🌅',
  },
  {
    id: 'workout',
    title: '40+ Minute Workout',
    description: 'Sharpen your blade — move with intent for 40+ minutes',
    icon: '💪',
  },
  {
    id: 'water',
    title: 'Drink 1 Gallon Of Water',
    description: 'Plan your hydration — discipline in every sip',
    icon: '💧',
  },
  {
    id: 'financial',
    title: 'Daily Personal Finance Touch Point',
    description: 'Stay in tune with your fiscal situation every day',
    icon: '💰',
  },
  {
    id: 'family_time',
    title: 'Intentional Family Time',
    description: 'Connect with your wife and kids individually today',
    icon: '❤️',
  },
  {
    id: 'no_substances',
    title: 'No Drugs Or Alcohol',
    description: 'An altered mind is an unsharpened mind',
    icon: '🚫',
  },
  {
    id: 'diet',
    title: 'Ingredient-Based Diet',
    description: 'Whole, minimally processed foods — know your fuel',
    icon: '🥗',
  },
  {
    id: 'journal',
    title: 'Daily Planner Or Journal Work',
    description: 'Capture your ideas, plans, fears, and victories',
    icon: '📓',
  },
];

export const TASK_IDS = TASKS.map((t) => t.id);
export const TOTAL_TASKS = TASKS.length;
