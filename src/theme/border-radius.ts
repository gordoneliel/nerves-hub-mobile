const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  round: 9999, // For fully rounded elements like circular buttons
} as const;

type BorderRadiusKey = keyof typeof borderRadius;
type BorderRadiusValue = (typeof borderRadius)[BorderRadiusKey];
type BorderRadius = Record<BorderRadiusKey, BorderRadiusValue>;

export { borderRadius };
export type { BorderRadius, BorderRadiusKey, BorderRadiusValue };
