import {
  ColorScheme,
  DARK_COLOR_SCHEME,
  DARK_COLOR_SCHEME_PREFERENCE,
  LIGHT_COLOR_SCHEME,
  LIGHT_COLOR_SCHEME_PREFERENCE,
} from 'types/settings';

export function colorSchemeToPreference(colorScheme: ColorScheme) {
  switch (colorScheme) {
    case LIGHT_COLOR_SCHEME:
      return LIGHT_COLOR_SCHEME_PREFERENCE;
    case DARK_COLOR_SCHEME:
    default:
      return DARK_COLOR_SCHEME_PREFERENCE;
  }
}

export function invertColorScheme(colorScheme: ColorScheme) {
  switch (colorScheme) {
    case LIGHT_COLOR_SCHEME:
      return DARK_COLOR_SCHEME;
    case DARK_COLOR_SCHEME:
    default:
      return LIGHT_COLOR_SCHEME;
  }
}
