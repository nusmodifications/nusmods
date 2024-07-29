export type ThemeId = string;

/**
 * Themes are the "color palette" of the website. They define the set of colors
 * being used across the website.
 */
export type Theme = {
  readonly id: ThemeId;
  readonly name: string;
};

/**
 * Color schemes simply define whether the website is in light or dark mode. This
 * is not to be confused with themese, which define the color palette of the website.
 */
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';

export const LIGHT_COLOR_SCHEME: ColorScheme = 'LIGHT_COLOR_SCHEME';
export const DARK_COLOR_SCHEME: ColorScheme = 'DARK_COLOR_SCHEME';

export type ColorSchemePreference =
  | 'SYSTEM_COLOR_SCHEME_PREFERENCE'
  | 'LIGHT_COLOR_SCHEME_PREFERENCE'
  | 'DARK_COLOR_SCHEME_PREFERENCE';

export const SYSTEM_COLOR_SCHEME_PREFERENCE: ColorSchemePreference =
  'SYSTEM_COLOR_SCHEME_PREFERENCE';
export const LIGHT_COLOR_SCHEME_PREFERENCE: ColorSchemePreference = 'LIGHT_COLOR_SCHEME_PREFERENCE';
export const DARK_COLOR_SCHEME_PREFERENCE: ColorSchemePreference = 'DARK_COLOR_SCHEME_PREFERENCE';
