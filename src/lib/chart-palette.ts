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
    DIGITAL_BANK: "#8b3fd9",
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
    DIGITAL_BANK: "#a970f0",
    accent: "#eab54a",
    muted: "#9db3a9",
    grid: "#22322b",
    surface: "#101c18",
    ink: "#f3f6f4",
  },
} as const;

export type ChartColors = typeof chartPalette.light;

/**
 * The dataviz skill's full validated 8-hue categorical series (order is the
 * CVD-safety mechanism — kept as documented, not re-sorted). Used where each
 * data point needs its own distinct identity color (e.g. "10 different banks
 * in one leaderboard") rather than being grouped by institution type. With
 * >8 items the palette cycles — acceptable here since every bar also carries
 * a direct text label, so color is a visual aid, not the only way to tell
 * two bars apart.
 */
export const seriesPalette = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
} as const;

export function seriesColor(index: number, isDark: boolean): string {
  const ramp = isDark ? seriesPalette.dark : seriesPalette.light;
  return ramp[index % ramp.length];
}
