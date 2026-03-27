const spacing = {
  1: 1,
  2: 2,
  4: 4,
  6: 6,
  12: 12,
  16: 16,
  18: 18,
  24: 24,
  30: 30,
  36: 36,
  42: 42,
  48: 48,
  54: 54,
  60: 60,
  66: 66,
  72: 72,
  78: 78,
  84: 84,
  90: 90,
  96: 96,
} as const;

type SpacingKey = keyof typeof spacing;
type SpacingValue = (typeof spacing)[SpacingKey];
type Spacing = Record<SpacingKey, SpacingValue>;

export { spacing };
export type { Spacing, SpacingKey, SpacingValue };
