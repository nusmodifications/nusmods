import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Mousetrap from 'mousetrap';
import { groupBy, map } from 'lodash';

import { DARK_MODE } from 'types/settings';
import themes from 'data/themes.json';
import { cycleTheme, toggleTimetableOrientation } from 'actions/theme';
import { openNotification } from 'actions/app';
import { toggleMode } from 'actions/settings';
import { intersperse } from 'utils/array';
import ComponentMap from 'utils/ComponentMap';
import type { State } from 'types/state';
import Modal from './Modal';
import styles from './KeyboardShortcuts.scss';

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

const KeyboardShortcuts: React.FC = () => {
  const [helpShown, setHelpShown] = useState(false);
  const closeModal = useCallback(() => setHelpShown(false), []);

  const mode = useSelector(({ settings }: State) => settings.mode);
  const themeId = useSelector(({ theme }: State) => theme.id);
  const dispatch = useDispatch();

  const history = useHistory();

  // NB: Because this is a ref, updates to `shortcuts` will not trigger a render.
  const shortcuts = useRef<KeyBinding[]>([]);

  useEffect(() => {
    function bind(
      key: Shortcut,
      section: Section,
      description: string,
      action: (e: Event) => void,
    ) {
      shortcuts.current.push({ key, description, section });
      Mousetrap.bind(key, action);
    }

    // Navigation
    bind('y', NAVIGATION, 'Go to today', () => {
      history.push('/today');
    });

    bind('t', NAVIGATION, 'Go to timetable', () => {
      history.push('/timetable');
    });

    bind('m', NAVIGATION, 'Go to module finder', () => {
      history.push('/modules');
    });

    bind('v', NAVIGATION, 'Go to venues page', () => {
      history.push('/venues');
    });

    bind('s', NAVIGATION, 'Go to settings', () => {
      history.push('/settings');
    });

    bind('/', NAVIGATION, 'Open global search', (e) => {
      if (ComponentMap.globalSearchInput) {
        ComponentMap.globalSearchInput.focus();

        // Prevents the '/' character from being entered into the global search bar
        e.preventDefault();
      }
    });

    bind('?', NAVIGATION, 'Show this help', () => setHelpShown(!helpShown));

    // Timetable shortcuts
    bind('o', TIMETABLE, 'Switch timetable orientation', () => {
      dispatch(toggleTimetableOrientation());
    });

    bind('d', TIMETABLE, 'Open download timetable menu', () => {
      const button = ComponentMap.downloadButton;
      if (button) {
        button.focus();
        button.click();
      }
    });

    // Toggle night mode
    bind('x', APPEARANCE, 'Toggle Night Mode', () => {
      dispatch(toggleMode());

      dispatch(
        openNotification(`Night mode ${mode === DARK_MODE ? 'on' : 'off'}`, {
          overwritable: true,
        }),
      );
    });

    // Cycle through themes
    function notifyThemeChange() {
      const theme = themes.find((t) => t.id === themeId);
      if (theme) {
        dispatch(
          openNotification(`Theme switched to ${theme.name}`, {
            timeout: THEME_NOTIFICATION_TIMEOUT,
            overwritable: true,
          }),
        );
      }
    }

    bind('z', APPEARANCE, 'Previous Theme', () => {
      dispatch(cycleTheme(-1));
      notifyThemeChange();
    });

    bind('c', APPEARANCE, 'Next Theme', () => {
      dispatch(cycleTheme(1));
      notifyThemeChange();
    });

    // ???
    Mousetrap.bind('up up down down left right left right b a', () => {
      history.push('/tetris');
    });

    return () => {
      shortcuts.current.forEach(({ key }) => Mousetrap.unbind(key));
      shortcuts.current = [];
    };
  }, [dispatch, helpShown, mode, history, themeId]);

  function renderShortcut(shortcut: Shortcut): React.ReactNode {
    if (typeof shortcut === 'string') {
      const capitalized = shortcut.replace(/\b([a-z])/, (c) => c.toUpperCase());
      return <kbd key={shortcut}>{capitalized}</kbd>;
    }
    return intersperse(shortcut.map(renderShortcut), ' or ');
  }

  const sections = groupBy(shortcuts.current, (shortcut) => shortcut.section);

  return (
    <Modal isOpen={helpShown} onRequestClose={closeModal} className={styles.modal} animate>
      <h2>Keyboard shortcuts</h2>

      <table className="table table-sm">
        {map(sections, (shortcutsInSection, heading) => (
          <tbody key={heading}>
            <tr>
              <th aria-label="Key column" />
              <th>{heading}</th>
            </tr>

            {shortcutsInSection.map((shortcut) => (
              <tr key={shortcut.description}>
                <td className={styles.key}>{renderShortcut(shortcut.key)}</td>
                <td>{shortcut.description}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </Modal>
  );
};

export default memo(KeyboardShortcuts);
