import { useWindowDimensions } from 'react-native';

/**
 * Adaptive layout numbers derived from the live window size, so every screen
 * re-flows on rotation, split-screen, tablets and small phones. No fixed pixels.
 */
export function useLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 600;
  const isLandscape = width > height;
  const isCompact = width < 360; // iPhone SE (1st gen) width is 320; SE 2/3 and mini are 375
  const columns = width >= 1100 ? 4 : width >= 760 ? 3 : 2;
  const contentWidth = Math.min(width, 1100);
  const gutter = isCompact ? 14 : 18;
  const horizontalInset = Math.max(gutter, Math.floor((width - contentWidth) / 2));
  const readingWidth = Math.min(width - horizontalInset * 2, 680);
  return {
    width,
    height,
    fontScale,
    isTablet,
    isLandscape,
    isCompact,
    columns,
    contentWidth,
    horizontalInset,
    readingWidth,
    gutter,
  };
}
