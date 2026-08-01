import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";

/**
 * Shared native-stack header options for the iOS 26 "native header" look.
 *
 * On iOS 26+ (Liquid Glass) the header is transparent so the glass material
 * shows through the large title and content scrolls underneath; on older iOS
 * we fall back to the standard opaque native large-title header (otherwise a
 * transparent header has no backing material and reads as broken).
 *
 * Mirrors the pattern used in spaces-mobile (`src/navigation/screen-options.ts`),
 * including its header sizing/weights (large title 26/700, title 16/600), but
 * keeps NervesHub's brand font.
 */

const HEADER_FONT_FAMILY = "PlusJakartaSans-VariableFont_wght";

export const headerLargeTitleStyle = {
  fontFamily: HEADER_FONT_FAMILY,
  fontSize: 26,
  fontWeight: "700",
} as const;

export const headerTitleStyle = {
  fontFamily: HEADER_FONT_FAMILY,
  fontSize: 16,
  fontWeight: "600",
} as const;

export const sharedStackScreenOptions: NativeStackNavigationOptions = {
  headerBackButtonDisplayMode: isLiquidGlassSupported ? "minimal" : undefined,
  headerTransparent: isLiquidGlassSupported,
  headerLargeTitle: true,
  headerLargeTitleStyle,
  headerTitleStyle,
};
