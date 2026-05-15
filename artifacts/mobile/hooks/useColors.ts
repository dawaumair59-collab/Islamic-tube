import colors from "@/constants/colors";

/**
 * Returns the light-mode design tokens.
 * IslamicTube always uses light mode — the color scheme is fixed.
 */
export function useColors() {
  return { ...colors.light, radius: colors.radius };
}
