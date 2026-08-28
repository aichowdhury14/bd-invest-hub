/**
 * Shared, CVD-validated chart color tokens (see the dataviz skill's validator —
 * this exact blue/orange/aqua triad passes all-pairs CVD checks in both modes
 * against this app's surfaces). Institution-type colors here are deliberately
 * more vibrant than the muted badge colors used in UI chrome elsewhere, since
 * charts benefit from more saturation than text-adjacent badges do.
 */
export const chartPalette = {
  light: {
    BANK: "#2a78d6",
    GOVERNMENT: "#eb6834",
    INVESTMENT_ORG: "#1baf7a",
    accent: "#d99a2b",
    muted: "#5b6b62",
    grid: "#e6e8e2",
    surface: "#ffffff",
    ink: "#10201a",
  },
  dark: {
    BANK: "#3987e5",
    GOVERNMENT: "#d95926",
    INVESTMENT_ORG: "#199e70",
    accent: "#eab54a",
    muted: "#9db3a9",
    grid: "#22322b",
    surface: "#101c18",
    ink: "#f3f6f4",
  },
} as const;

export type ChartColors = typeof chartPalette.light;
