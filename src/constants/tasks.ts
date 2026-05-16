import { Task } from '../types';

export const TASKS: Task[] = [
  {
    id: 'wake_up',
    title: 'Wake Up At A Set Time',
    description: 'Rise at the same time every day',
    icon: '🌅',
  },
  {
    id: 'workout',
    title: '40+ Minute Workout',
    description: 'Move with purpose, 40+ minutes',
    icon: '💪',
  },
  {
    id: 'water',
    title: 'Drink 1 Gallon Of Water',
    description: 'Plan your hydration all day',
    icon: '💧',
  },
  {
    id: 'financial',
    title: 'Daily Personal Finance Touch Point',
    description: 'Know your numbers every day',
    icon: '💰',
  },
  {
    id: 'family_time',
    title: 'Intentional Family Time',
    description: 'Connect individually every day',
    icon: '❤️',
  },
  {
    id: 'no_substances',
    title: 'No Drugs Or Alcohol',
    description: 'An altered mind is unsharpened',
    icon: '🚫',
  },
  {
    id: 'diet',
    title: 'Ingredient-Based Diet',
    description: 'Whole ingredients — real fuel',
    icon: '🥗',
  },
  {
    id: 'journal',
    title: 'Daily Planner Or Journal Work',
    description: 'Plans, ideas, fears, victories',
    icon: '📓',
  },
];

export const TASK_IDS = TASKS.map((t) => t.id);
export const TOTAL_TASKS = TASKS.length;
