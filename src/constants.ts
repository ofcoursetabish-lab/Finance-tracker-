import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Others',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#F87171',
  Transport: '#60A5FA',
  Shopping: '#FBBF24',
  Bills: '#34D399',
  Entertainment: '#A78BFA',
  Health: '#F472B6',
  Education: '#818CF8',
  Others: '#9CA3AF',
};
