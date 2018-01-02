// @flow

import type { Store } from 'redux';
import Mousetrap from 'mousetrap';

import type { State } from 'reducers';
import themes from 'data/themes.json';
import { DARK_MODE } from 'types/settings';
import { toggleMode } from 'actions/settings';
import { cycleTheme } from 'actions/theme';
import { openNotification } from 'actions/app';

export default function initKeyboardShortcuts(store: Store<State, *, *>) {
  // Toggle night mode
  Mousetrap.bind('x', () => {
    store.dispatch(toggleMode());

    const mode = store.getState().settings.mode;
    store.dispatch(openNotification(`Night mode ${mode === DARK_MODE ? 'on' : 'off'}`));
  });

  // Cycle through themes
  function notifyThemeChange() {
    const themeId = store.getState().theme.id;
    const theme = themes.find((t) => t.id === themeId);

    if (theme) {
      store.dispatch(openNotification(`Theme switched to ${theme.name}`));
    }
  }

  Mousetrap.bind('z', () => {
    store.dispatch(cycleTheme(-1));
    notifyThemeChange();
  });

  Mousetrap.bind('c', () => {
    store.dispatch(cycleTheme(1));
    notifyThemeChange();
  });
}
