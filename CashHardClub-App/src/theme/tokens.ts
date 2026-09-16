// Design tokens — mirrored from cashhardclub.com index.html (":root" block). Never deviate.
export const colors = {
  bg: '#000000',
  surface: '#0b0b0b',
  surface2: '#141414',
  text: '#ffffff',
  body: '#e5e5e5',
  dim: '#8a8a8a', // never below #888 on black (site rule)
  accent: '#c8a04a', // CASH HARD CLUB brass-gold
  accentHover: '#eec27c',
  accentInk: '#120e08', // text on gold
  line: 'rgba(200,160,74,0.22)',
  lineSoft: 'rgba(255,255,255,0.08)',
  row: 'rgba(255,255,255,0.06)',
  danger: '#e06a6a',
} as const;

export const fonts = {
  display: 'Cinzel_700Bold',
  displaySemi: 'Cinzel_600SemiBold',
  sans: 'Inter_400Regular',
  sansLight: 'Inter_300Light',
  sansMedium: 'Inter_500Medium',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 4, md: 8, lg: 14, pill: 999 } as const;

/** Gold-foil button gradient (top → bottom), same stops as the website's .btn */
export const GOLD_GRADIENT: [string, string] = ['#ddb968', '#c8a04a'];
