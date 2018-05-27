// @flow
import React, { PureComponent } from 'react';
import { withRouter, type ContextRouter } from 'react-router-dom';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Mousetrap from 'mousetrap';
import { groupBy, map } from 'lodash';

import { DARK_MODE } from 'types/settings';
import themes from 'data/themes.json';
import { cycleTheme } from 'actions/theme';
import { openNotification } from 'actions/app';
import { toggleMode } from 'actions/settings';
import type { State as StoreState } from 'reducers';
import { intersperse } from 'utils/array';
import Modal from './Modal';
import styles from './KeyboardShortcuts.scss';

type Props = ContextRouter & {
  dispatch: Dispatch<*>,
  state: StoreState,
};

type State = {
  helpShown: boolean,
};

type Section = 'Appearance' | 'Navigation';
const APPEARANCE: Section = 'Appearance';
const NAVIGATION: Section = 'Navigation';

type Shortcut = string | string[];
type KeyBinding = {
  key: Shortcut,
  section: Section,
  description: string,
};

const THEME_NOTIFICATION_TIMEOUT = 1000;

class KeyboardShortcutsComponent extends PureComponent<Props, State> {
  state = {
    helpShown: false,
  };

  componentDidMount() {
    const { state, dispatch, history } = this.props;

    // Navigation
    this.bind('t', NAVIGATION, 'Go to timetable', () => {
      history.push('/timetable');
    });

    this.bind('m', NAVIGATION, 'Go to module finder', () => {
      history.push('/modules');
    });

    this.bind('v', NAVIGATION, 'Go to venues page', () => {
      history.push('/venues');
    });

    this.bind('s', NAVIGATION, 'Go to settings', () => {
      history.push('/settings');
    });

    this.bind('?', NAVIGATION, 'Show this help', () =>
      this.setState({ helpShown: !this.state.helpShown }),
    );

    // Toggle night mode
    this.bind('x', APPEARANCE, 'Toggle Night Mode', () => {
      this.props.dispatch(toggleMode());

      dispatch(
        openNotification(`Night mode ${state.settings.mode === DARK_MODE ? 'on' : 'off'}`, {
          overwritable: true,
        }),
      );
    });

    // Cycle through themes
    this.bind('z', APPEARANCE, 'Previous Theme', () => {
      dispatch(cycleTheme(-1));
      this.notifyThemeChange();
    });

    this.bind('c', APPEARANCE, 'Next Theme', () => {
      dispatch(cycleTheme(1));
      this.notifyThemeChange();
    });
  }

  shortcuts: KeyBinding[] = [];

  closeModal = () => this.setState({ helpShown: false });

  bind(key: Shortcut, section: Section, description: string, action: () => void) {
    this.shortcuts.push({ key, description, section });

    Mousetrap.bind(key, action);
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

  renderShortcut = (shortcut: Shortcut) => {
    if (typeof shortcut === 'string') {
      const capitalized = shortcut.replace(/\b([a-z])/, (c) => c.toUpperCase());
      return <kbd key={shortcut}>{capitalized}</kbd>;
    }

    return intersperse(shortcut.map(this.renderShortcut), ' or ');
  };

  render() {
    const sections = groupBy(this.shortcuts, (shortcut) => shortcut.section);

    return (
      <Modal
        isOpen={this.state.helpShown}
        onRequestClose={this.closeModal}
        className={styles.modal}
      >
        <h2>Keyboard shortcuts</h2>

        <table className="table table-sm">
          {map(sections, (shortcuts, heading) => (
            <tbody key={heading}>
              <tr>
                <th />
                <th>{heading}</th>
              </tr>

              {shortcuts.map((shortcut) => (
                <tr key={shortcut.key}>
                  <td className={styles.key}>{this.renderShortcut(shortcut.key)}</td>
                  <td>{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Modal>
    );
  }
}

const KeyboardShortcutsConnected = connect((state) => ({ state }), (dispatch) => ({ dispatch }))(
  KeyboardShortcutsComponent,
);

export default withRouter(KeyboardShortcutsConnected);
