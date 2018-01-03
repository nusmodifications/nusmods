// @flow

import type { Store } from 'redux';
import Mousetrap from 'mousetrap';
import { debounce } from 'lodash';

import type { State } from 'reducers';
import themes from 'data/themes.json';
import { DARK_MODE } from 'types/settings';
import { toggleMode } from 'actions/settings';
import { cycleTheme } from 'actions/theme';
import { openNotification } from 'actions/app';

const THEME_NOTIFICATION_TIMEOUT = 1000;

export default function initKeyboardShortcuts(store: Store<State, *, *>) {
  // Toggle night mode
  Mousetrap.bind('x', () => {
    store.dispatch(toggleMode());

    const mode = store.getState().settings.mode;
    store.dispatch(openNotification(`Night mode ${mode === DARK_MODE ? 'on' : 'off'}`));
  });

  // Cycle through themes
  const notifyThemeChange = debounce(
    () => {
      const themeId = store.getState().theme.id;
      const theme = themes.find((t) => t.id === themeId);

      if (theme) {
        store.dispatch(
          openNotification(`Theme switched to ${theme.name}`, {
            timeout: THEME_NOTIFICATION_TIMEOUT,
          }),
        );
      }
    },
    THEME_NOTIFICATION_TIMEOUT,
    { leading: true },
  );

  Mousetrap.bind('z', () => {
    store.dispatch(cycleTheme(-1));
    notifyThemeChange();
  });

  Mousetrap.bind('c', () => {
    store.dispatch(cycleTheme(1));
    notifyThemeChange();
  });
}
