export const COLORS = {
  primary: '#3da98a',
  primaryLight: '#e1f5ee',
  primaryDark: '#2d8a70',
  accent: '#e8633a',
  accentLight: '#faece7',
  accentDark: '#c4522e',

  light: {
    bg: '#f0f4f8',
    card: '#ffffff',
    cardAlt: '#f8fafc',
    text: '#1a1a2e',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    input: '#f9fafb',
    inputBorder: '#d1d5db',
    overlay: 'rgba(0,0,0,0.5)',
    tabBar: '#ffffff',
    header: '#3da98a',
    shadow: 'rgba(0,0,0,0.08)',
  },

  dark: {
    bg: '#0f0f1a',
    card: '#1e1e30',
    cardAlt: '#252538',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#2d2d44',
    input: '#252538',
    inputBorder: '#3d3d58',
    overlay: 'rgba(0,0,0,0.7)',
    tabBar: '#1e1e30',
    header: '#1e1e30',
    shadow: 'rgba(0,0,0,0.3)',
  },

  // Semantic
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Role colors
  parent: '#3da98a',
  parentLight: '#e1f5ee',
  teacher: '#3b82f6',
  teacherLight: '#dbeafe',
  admin: '#8b5cf6',
  adminLight: '#ede9fe',

  // Activity colors
  emerald: '#10b981',
  emeraldLight: '#d1fae5',
  blue: '#3b82f6',
  blueLight: '#dbeafe',
  orange: '#f97316',
  orangeLight: '#ffedd5',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  pink: '#ec4899',
  pinkLight: '#fce7f3',
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  teal: '#14b8a6',
  tealLight: '#ccfbf1',
  red: '#ef4444',
  redLight: '#fee2e2',
};

export function getTheme(isDark) {
  return isDark ? COLORS.dark : COLORS.light;
}
