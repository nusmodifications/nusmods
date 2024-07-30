import {
  DARK_COLOR_SCHEME,
  DARK_COLOR_SCHEME_PREFERENCE,
  LIGHT_COLOR_SCHEME,
  LIGHT_COLOR_SCHEME_PREFERENCE,
  SYSTEM_COLOR_SCHEME_PREFERENCE,
} from 'types/settings';
import type { ColorScheme } from 'types/settings';
import { prefersColorScheme } from 'utils/css';
import { useSelector } from 'react-redux';
import type { State } from 'types/state';
import useMediaQuery from './useMediaQuery';

/**
 * @returns Whether the user's (operating) system prefers dark mode.
 */
export default function useColorScheme(): ColorScheme {
  const colorSchemePreference = useSelector((state: State) => state.settings.colorScheme);
  const systemPrefersDarkColorScheme = useMediaQuery(prefersColorScheme('dark'));
  switch (colorSchemePreference) {
    case SYSTEM_COLOR_SCHEME_PREFERENCE:
      return systemPrefersDarkColorScheme ? DARK_COLOR_SCHEME : LIGHT_COLOR_SCHEME;
    case DARK_COLOR_SCHEME_PREFERENCE:
      return DARK_COLOR_SCHEME;
    case LIGHT_COLOR_SCHEME_PREFERENCE:
    default:
      return LIGHT_COLOR_SCHEME;
  }
}
