import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Mousetrap from 'mousetrap';
import { groupBy, map } from 'lodash';

import { Mode, ThemeId, DARK_MODE } from 'types/settings';
import { Actions } from 'types/actions';
import themes from 'data/themes.json';
import { cycleTheme, toggleTimetableOrientation } from 'actions/theme';
import { openNotification } from 'actions/app';
import { toggleMode } from 'actions/settings';
import { intersperse } from 'utils/array';
import ComponentMap from 'utils/ComponentMap';
import { State as StoreState } from 'types/state';
import Modal from './Modal';
import styles from './KeyboardShortcuts.scss';

type Props = RouteComponentProps & {
  dispatch: Dispatch<Actions>;
  theme: ThemeId;
  mode: Mode;
};

type State = {
  helpShown: boolean;
};

type Section = 'Appearance' | 'Navigation' | 'Timetable';
const APPEARANCE: Section = 'Appearance';
const NAVIGATION: Section = 'Navigation';
const TIMETABLE: Section = 'Timetable';

type Shortcut = string | string[];
type KeyBinding = {
  key: Shortcut;
  section: Section;
  description: string;
};

const THEME_NOTIFICATION_TIMEOUT = 1000;

export class KeyboardShortcutsComponent extends React.PureComponent<Props, State> {
  state = {
    helpShown: false,
  };

  shortcuts: KeyBinding[] = [];

  componentDidMount() {
    const { dispatch, history } = this.props;

    // Navigation
    this.bind('y', NAVIGATION, 'Go to today', () => {
      history.push('/today');
    });

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

    this.bind('/', NAVIGATION, 'Open global search', (e) => {
      if (ComponentMap.globalSearchInput) {
        ComponentMap.globalSearchInput.focus();

        // Prevents the '/' character from being entered into the global search bar
        e.preventDefault();
      }
    });

    this.bind('?', NAVIGATION, 'Show this help', () =>
      this.setState((state) => ({ helpShown: !state.helpShown })),
    );

    // Timetable shortcuts
    this.bind('o', TIMETABLE, 'Switch timetable orientation', () => {
      dispatch(toggleTimetableOrientation());
    });

    this.bind('d', TIMETABLE, 'Open download timetable menu', () => {
      const button = ComponentMap.downloadButton;
      if (button) {
        button.focus();
        button.click();
      }
    });

    // Toggle night mode
    this.bind('x', APPEARANCE, 'Toggle Night Mode', () => {
      this.props.dispatch(toggleMode());

      dispatch(
        openNotification(`Night mode ${this.props.mode === DARK_MODE ? 'on' : 'off'}`, {
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

    // ???
    Mousetrap.bind('up up down down left right left right b a', () => {
      history.push('/tetris');
    });
  }

  closeModal = () => this.setState({ helpShown: false });

  bind(key: Shortcut, section: Section, description: string, action: (e: Event) => void) {
    this.shortcuts.push({ key, description, section });

    Mousetrap.bind(key, action);
  }

  notifyThemeChange() {
    const themeId = this.props.theme;
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

  renderShortcut = (shortcut: Shortcut): React.ReactNode => {
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
        animate
      >
        <h2>Keyboard shortcuts</h2>

        <table className="table table-sm">
          {map(sections, (shortcuts, heading) => (
            <tbody key={heading}>
              <tr>
                <th aria-label="Key column" />
                <th>{heading}</th>
              </tr>

              {shortcuts.map((shortcut) => (
                <tr key={shortcut.description}>
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

const KeyboardShortcutsConnected = connect((state: StoreState) => ({
  mode: state.settings.mode,
  theme: state.theme.id,
}))(KeyboardShortcutsComponent);

// export default withRouter(KeyboardShortcutsConnected);
export default KeyboardShortcutsConnected;
