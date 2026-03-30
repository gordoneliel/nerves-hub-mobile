// import {useColorScheme} from 'react-native';

export const colors = {
  amber: {
    0: "#fff5e6",
    1: "#f6dab9",
    2: "#ECBE87",
    3: "#D1915D",
    4: "#A6653E",
  },
  midnight: {
    1: "#304354",
    2: "#1D2C38",
  },
  gray: {
    "000": "#F4F5F6", // Lightest
    "100": "#EEF0F1",
    "200": "#E0E3E6",
    "300": "#C1C6CD",
    "400": "#929BA5",
    "500": "#67727E",
    "600": "#4E5865",
    "700": "#39424C",
    "800": "#31383F",
    "900": "#272D34",
    carbono: "#121921",
  },
  blue: {
    "000": "#F6F9FE",
    "050": "#E6F1FF",
    "100": "#B4D5FE",
    "200": "#76B3FE",
    "300": "#3A92FD",
    "400": "#0876FD",
    "500": "#0964D3",
    "600": "#0B51A8",
    "700": "#0E3D77",
    "800": "#102C4C",
  },
  orange: {
    "000": "#FEFAF6",
    "050": "#FFF4E6",
    "100": "#FEDCB4",
    "200": "#FEC176",
    "300": "#FDA53A",
    "400": "#FD8E08",
    "500": "#CF770C",
    "600": "#A26011",
    "700": "#6E4717",
    "800": "#402F1C",
  },
  green: {
    "000": "#F6FEF9",
    "050": "#E6FFF4",
    "100": "#B4FEDC",
    "200": "#76FEC1",
    "300": "#3AFDA5",
    "400": "#08FD8E",
    "500": "#0CCF77",
    "600": "#11A260",
    "700": "#176E47",
    "800": "#1C402F",
  },
  red: {
    "000": "#FEF6F6",
    "050": "#FFE6E6",
    "100": "#FFB4B4",
    "200": "#FF7676",
    "300": "#FF3A3A",
    "400": "#FF0808",
    "500": "#D30909",
    "600": "#A80B0B",
    "700": "#770E0E",
    "800": "#4C1010",
  },
  sage: {
    1: "#E0E9E4",
    2: "#CBDCD3",
    3: "#A7BDB1",
    4: "#677B70",
  },
  ocean: {
    1: "#D8E0EE",
    2: "#B9C8E1",
    3: "#919FC2",
    4: "#647295",
  },
  linen: {
    1: "#F7F1E8",
    2: "#EAE2D5",
    3: "#DFD2C1",
    4: "#D1BEA6",
  },
  blush: {
    1: "#FCD2D0",
    2: "#F3B5B3",
    3: "#DF9996",
    4: "#AA615E",
  },
};

export type ColorTheme = {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
  inputBorder: string;
  textHeader: string;
  textSubHeader: string;
  textBody: string;
  textCaption: string;
  textDestructive: string;
  textHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  accent: string;
  accentEmphasis: string;
  success: string;
  successSubtle: string;
  danger: string;
  dangerSubtle: string;
  warning: string;
  warningSubtle: string;
  white: string;
  black: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  sensorHealth: {
    healthy: string;
    unhealthy: string;
    unknown: string;
    offline: string;
    degraded: string;
  };
};

export const COLORS_LIGHT: ColorTheme = {
  background: "#F4F5F6",
  backgroundSecondary: "rgba(255, 255, 255, 0.95)",
  backgroundTertiary: "rgba(238, 240, 242, 0.9)",
  surface: "#F6F8FA",
  surfaceHover: "#EAEEF2",
  border: "#D0D7DE",
  borderLight: "#E1E4E8",
  inputBorder: "#E0E0E0",
  textHeader: "#121B03F5",
  textSubHeader: "#67727E",
  textBody: "#121B03F5",
  textCaption: "#929BA5",
  textHighlight: "#007AFF",
  textDestructive: colors.red["500"],
  textPrimary: colors.gray[700],
  textSecondary: "#656D76",
  textTertiary: "#8C959F",
  textPlaceholder: "#B0B8C1",
  accent: "#6366F1",
  accentEmphasis: "#4F46E5",
  success: "#1A7F37",
  successSubtle: "#DAFBE1",
  danger: "#CF222E",
  dangerSubtle: "#FFEBE9",
  warning: "#9A6700",
  warningSubtle: "#FFF8C5",
  white: "#FFFFFF",
  black: "#010409",
  colors: {
    primary: "#6366F1",
    secondary: colors.amber[3],
    background: "#F4F5F6",
  },
  sensorHealth: {
    healthy: "#9ACD32",
    unhealthy: colors.red["500"],
    unknown: colors.gray["300"],
    offline: "#F22200",
    degraded: colors.orange["500"],
  },
};

// Dark palette derived via OKLCH (lowered L, preserved C & H)
// background   oklch(0.085 0.002 260) → #080809
// bgSecondary  oklch(0.145 0.001 260) → #1A1A1B
// bgTertiary   oklch(0.125 0.02 250) → #11161E
// surface      oklch(0.125 0.02 250) → #11161E
// surfaceHover oklch(0.155 0.02 250) → #181E28
// border       oklch(0.200 0.015 250)→ #252C35
// borderLight  oklch(0.175 0.015 250)→ #1E252E
export const COLORS_DARK: ColorTheme = {
  background: "#050506",
  backgroundSecondary: "#111113",
  backgroundTertiary: "#252528",
  surface: "#11161E",
  surfaceHover: "#181E28",
  border: "#252C35",
  borderLight: "#1E252E",
  inputBorder: "#252C35",
  textHeader: "#F0F3F6",
  textSubHeader: "#C9D1D9",
  textBody: "#E6EDF3",
  textCaption: "#8B949E",
  textHighlight: "#58A6FF",
  textDestructive: colors.red["400"],
  textPrimary: "#F0F3F6",
  textSecondary: "#C9D1D9",
  textTertiary: "#8B949E",
  textPlaceholder: "#3E454E",
  accent: "#818CF8",
  accentEmphasis: "#6366F1",
  success: "#3FB950",
  successSubtle: "#122E20",
  danger: "#F85149",
  dangerSubtle: "#3A1616",
  warning: "#D29922",
  warningSubtle: "#2E2200",
  white: "#FFFFFF",
  black: "#010409",
  colors: {
    primary: colors.blue["500"],
    secondary: colors.orange["500"],
    background: "#080809",
  },
  sensorHealth: {
    healthy: colors.green["500"],
    unhealthy: colors.red["400"],
    unknown: colors.gray["500"],
    offline: colors.red["400"],
    degraded: colors.orange["400"],
  },
};

export function useColors() {
  // const colorScheme = useColorScheme();
  return COLORS_LIGHT;
  // return colorScheme === 'dark' ? COLORS_DARK : COLORS_LIGHT;
}

// Contender for background
// backgroundColor: 'rgba(255, 255, 255, 0.1)'
