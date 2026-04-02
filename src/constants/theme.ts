// Primal / tribal color scheme — black and red
// Hex codes can be swapped here once provided
export const COLORS = {
  // Backgrounds
  background: '#0A0A0A',
  surface: '#111111',
  surfaceElevated: '#1A1A1A',
  border: '#1E1E1E',
  borderStrong: '#2E2E2E',

  // Red palette
  red: '#C41E1E',       // primary accent
  redBright: '#E52222', // active / highlight
  redDark: '#7A0F0F',   // secondary accent
  redDeep: '#3D0707',   // deep background tint
  redMuted: '#4A1010',  // subtle fill

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#444444',

  // State colors
  complete: '#C41E1E',    // task / day complete
  missed: '#3D0707',      // missed day (past, not complete)
  inProgress: '#7A0F0F',  // today, partial
  upcoming: '#161616',    // future days

  // Tab bar
  tabActive: '#E52222',
  tabInactive: '#444444',
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    xxxl: 40,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
