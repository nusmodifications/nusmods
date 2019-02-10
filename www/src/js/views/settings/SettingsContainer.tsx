import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { Faculty } from 'types/modules';
import { Mode, ThemeId } from 'types/settings';
import { State as StoreState } from 'reducers';

import availableThemes from 'data/themes.json';
import { selectTheme } from 'actions/theme';
import { selectFaculty, selectMode, toggleBetaTesting } from 'actions/settings';
import ScrollToTop from 'views/components/ScrollToTop';
import Timetable from 'views/timetable/Timetable';
import Title from 'views/components/Title';
import deferComponentRender from 'views/hocs/deferComponentRender';

import Online from 'views/components/Online';
import { supportsCSSVariables } from 'utils/css';

import ThemeOption from './ThemeOption';
import ModeSelect from './ModeSelect';
import previewTimetable from './previewTimetable';
import BetaToggle from './BetaToggle';
import RefreshPrompt from './RefreshPrompt';
import styles from './SettingsContainer.scss';

type Props = {
  newStudent: boolean;
  faculty: Faculty;
  currentThemeId: string;
  mode: Mode;
  betaTester: boolean;

  selectTheme: (theme: ThemeId) => void;
  selectMode: (mode: Mode) => void;

  toggleBetaTesting: () => void;
};

class SettingsContainer extends React.Component<Props> {
  renderNightModeOption() {
    return (
      <div>
        <h4 id="night-mode">Night Mode</h4>
        <div className={styles.toggleRow}>
          <div className={styles.toggleDescription}>
            <p>
              Night mode turns the light surfaces of the page dark, creating an experience ideal for
              the dark. Try it out!
            </p>
            <p>
              Protip: Press <kbd>X</kbd> to toggle modes anywhere on NUSMods.
            </p>
          </div>
          <div className={styles.toggle}>
            <ModeSelect mode={this.props.mode} onSelectMode={this.props.selectMode} />
          </div>
        </div>
        <hr />
      </div>
    );
  }

  render() {
    const { currentThemeId } = this.props;

    return (
      <div className={classnames(styles.settingsPage, 'page-container')}>
        <ScrollToTop onComponentDidMount />
        <Title>Settings</Title>

        <Online>
          <RefreshPrompt />
        </Online>

        <h1 className={styles.title}>Settings</h1>
        <hr />

        {supportsCSSVariables() && this.renderNightModeOption()}

        <h4 id="theme">Theme</h4>

        <p>Liven up your timetable with different color schemes!</p>
        <p>
          Protip: Press <kbd>Z</kbd>/<kbd>C</kbd> to cycle through the themes anywhere on NUSMods.
        </p>

        <div className={styles.preview}>
          <Timetable lessons={previewTimetable} />
        </div>

        <div>
          {availableThemes.map((theme) => (
            <ThemeOption
              key={theme.id}
              className={styles.themeOption}
              theme={theme}
              isSelected={currentThemeId === theme.id}
              onSelectTheme={this.props.selectTheme}
            />
          ))}
        </div>

        <hr />

        <BetaToggle
          betaTester={this.props.betaTester}
          toggleStates={this.props.toggleBetaTesting}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  newStudent: state.settings.newStudent,
  faculty: state.settings.faculty,
  mode: state.settings.mode,
  corsNotification: state.settings.corsNotification,
  currentThemeId: state.theme.id,
  betaTester: state.settings.beta || false,
});

const connectedSettings = connect(
  mapStateToProps,
  {
    selectTheme,
    selectFaculty,
    selectMode,
    toggleBetaTesting,
  },
)(SettingsContainer);
export default deferComponentRender(connectedSettings);
