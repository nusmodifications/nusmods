// @flow
import { PureComponent } from 'react';
import { withRouter, type ContextRouter } from 'react-router-dom';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Mousetrap from 'mousetrap';

import { DARK_MODE } from 'types/settings';
import themes from 'data/themes.json';
import { cycleTheme } from 'actions/theme';
import { openNotification } from 'actions/app';
import { toggleMode } from 'actions/settings';
import type { State } from 'reducers';

type Props = ContextRouter & {
  dispatch: Dispatch<*>,
  state: State,
};

const THEME_NOTIFICATION_TIMEOUT = 1000;

class KeyboardShortcutsComponent extends PureComponent<Props> {
  componentDidMount() {
    const { state, dispatch } = this.props;

    // Toggle night mode
    Mousetrap.bind('x', () => {
      this.props.dispatch(toggleMode());

      dispatch(
        openNotification(`Night mode ${state.settings.mode === DARK_MODE ? 'on' : 'off'}`, {
          overwritable: true,
        }),
      );
    });

    // Cycle through themes
    Mousetrap.bind('z', () => {
      dispatch(cycleTheme(-1));
      this.notifyThemeChange();
    });

    Mousetrap.bind('c', () => {
      dispatch(cycleTheme(1));
      this.notifyThemeChange();
    });
  }

  notifyThemeChange() {
    const themeId = this.props.state.theme.id;
    const theme = themes.find((t) => t.id === themeId);

    if (theme) {
      this.props.dispatch(
        openNotification(`Theme switched to ${theme.name}`, {
          timeout: THEME_NOTIFICATION_TIMEOUT,
          overwritable: true,
        }),
      );
    }
  }
}

const KeyboardShortcutsConnected = connect((state) => ({ state }), (dispatch) => ({ dispatch }))(
  KeyboardShortcutsComponent,
);

export default withRouter(KeyboardShortcutsConnected);
