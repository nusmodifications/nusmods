// @flow

import Mousetrap from 'mousetrap';
import type { Store } from 'redux';
import { toggleMode } from 'actions/settings';
import { cycleTheme } from 'actions/theme';

export default function initKeyboardShortcuts(store: Store<*, *, *>) {
  // Toggle night mode
  Mousetrap.bind('x', () => store.dispatch(toggleMode()));

  // Cycle through themes
  Mousetrap.bind('z', () => store.dispatch(cycleTheme(-1)));
  Mousetrap.bind('c', () => store.dispatch(cycleTheme(1)));
}
