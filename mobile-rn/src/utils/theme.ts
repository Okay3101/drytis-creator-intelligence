export const colors = {
  primary: '#9FA1FF',
  primaryLight: '#EEEEFF',
  primaryDark: '#7B7EE8',
  primaryGlow: 'rgba(159, 161, 255, 0.25)',

  accent: '#F5CBCB',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',

  // Light skeuomorphic surfaces
  bg: '#FBEFEF',
  surface: '#F5CBCB',
  surfaceRaised: '#FDF4F4',
  surfaceAlt: '#F5CBCB',
  surfaceDepressed: '#F0C0C0',

  // Borders & highlights
  border: '#DDD9D0',
  borderLight: '#E8E4DC',
  highlight: 'rgba(255,255,255,0.9)',
  shadow: 'rgba(0,0,0,0.12)',
  innerShadow: 'rgba(0,0,0,0.08)',

  text: '#1A1714',
  textMuted: '#7A7168',
  textDim: '#B0A99E',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const font = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,
};

export const shadows = {
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    shadowColor: '#9FA1FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  inset: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 0,
  },
};
