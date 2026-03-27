export type Colors = {
  [K in keyof typeof darkColors]: string;
};

export const darkColors = {
  background: "rgb(254, 249, 243)",
  surface: "#161B22",
  surfaceHover: "#1C2128",
  border: "#30363D",
  borderLight: "#21262D",

  textPrimary: "#E6EDF3",
  textSecondary: "#8B949E",
  textTertiary: "#6E7681",
  textPlaceholder: "#484F58",

  accent: "#58A6FF",
  accentEmphasis: "#388BFD",
  success: "#3FB950",
  successSubtle: "#1A4731",
  danger: "#F85149",
  dangerSubtle: "#4A1E1E",
  warning: "#D29922",
  warningSubtle: "#3D2E00",

  white: "#FFFFFF",
  black: "#010409",
} as const;

export const lightColors: Colors = {
  background: "rgb(254, 249, 243)",
  surface: "#F6F8FA",
  surfaceHover: "#EAEEF2",
  border: "#D0D7DE",
  borderLight: "#E1E4E8",

  textPrimary: "#1F2328",
  textSecondary: "#656D76",
  textTertiary: "#8C959F",
  textPlaceholder: "#B0B8C1",

  accent: "#0969DA",
  accentEmphasis: "#0550AE",
  success: "#1A7F37",
  successSubtle: "#DAFBE1",
  danger: "#CF222E",
  dangerSubtle: "#FFEBE9",
  warning: "#9A6700",
  warningSubtle: "#FFF8C5",
  white: "#FFFFFF",
  black: "#010409",
} as const;

// Keep backward-compatible default export for static usage
export const colors = darkColors;

export function getTypography(c: Colors) {
  return {
    title: {
      fontSize: 26,
      fontWeight: "600" as const,
      color: c.textPrimary,
      lineHeight: 28,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "600" as const,
      color: c.textPrimary,
      lineHeight: 28,
    },
    body: {
      fontSize: 14,
      fontWeight: "400" as const,
      color: c.textPrimary,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: "400" as const,
      color: c.textSecondary,
    },
    caption: {
      fontSize: 11,
      fontWeight: "400" as const,
      color: c.textTertiary,
    },
    mono: {
      fontSize: 12,
      fontFamily: "monospace" as const,
      color: c.textSecondary,
    },
    monoSmall: {
      fontSize: 10,
      fontFamily: "monospace" as const,
      color: c.textTertiary,
    },
  };
}

export const typography = getTypography(darkColors);

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
