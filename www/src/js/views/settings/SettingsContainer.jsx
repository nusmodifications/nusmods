// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import deferComponentRender from 'views/hocs/deferComponentRender';
import classnames from 'classnames';

import type { Faculty } from 'types/modules';
import type { Mode } from 'types/settings';
import type { State as StoreState } from 'reducers';

import availableThemes from 'data/themes.json';
import { selectTheme } from 'actions/theme';
import {
  selectNewStudent,
  selectFaculty,
  selectMode,
  toggleBetaTesting,
  setLoadDisqusManually,
} from 'actions/settings';
import ScrollToTop from 'views/components/ScrollToTop';
import Timetable from 'views/timetable/Timetable';
import Title from 'views/components/Title';

import Online from 'views/components/Online';
import { supportsCSSVariables } from 'utils/css';
import { withTracker } from 'bootstrapping/mamoto';
import ExternalLink from 'views/components/ExternalLink';
import Toggle from 'views/components/Toggle';

import ThemeOption from './ThemeOption';
import ModeSelect from './ModeSelect';
import previewTimetable from './previewTimetable';
import BetaToggle from './BetaToggle';
import RefreshPrompt from './RefreshPrompt';
import styles from './SettingsContainer.scss';

type Props = {
  newStudent: boolean,
  faculty: Faculty,
  currentThemeId: string,
  mode: Mode,
  betaTester: boolean,
  loadDisqusManually: boolean,

  selectTheme: Function,
  selectNewStudent: Function,
  selectFaculty: Function,
  selectMode: Function,

  toggleBetaTesting: () => void,
  setLoadDisqusManually: (boolean) => void,
};

type State = {|
  +allowTracking: boolean,
|};

class SettingsContainer extends Component<Props, State> {
  state = {
    allowTracking: true,
  };

  componentDidMount() {
    withTracker((tracker) =>
      this.setState({
        allowTracking: !tracker.isUserOptedOut(),
      }),
    );
  }

  onToggleTracking = (allowTracking: boolean) => {
    withTracker((tracker) => {
      if (allowTracking) {
        tracker.forgetUserOptOut();
      } else {
        tracker.optUserOut();
      }

      this.setState({ allowTracking: !tracker.isUserOptedOut() });
    });
  };

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

        <h4 id="privacy">Privacy</h4>

        <div className="row">
          <div className="col-md-8">
            <p>
              We collect anonymous, aggregated usage information on NUSMods - think of it as a
              survey to tells us which browsers to support and what features are popular. Note that
              if you opt out, we may remove features that you use since we won&apos;t know if anyone
              is using them.
            </p>
            <p>
              We do not use this information for advertising, or share this information with
              anybody. You can see the data we collect at{' '}
              <ExternalLink href="https://analytics.nusmods.com/">
                analytics.nusmods.com
              </ExternalLink>
              .
            </p>
          </div>

          <div className="col-md-4">
            {navigator.doNotTrack === '1' ? (
              <div className="alert alert-warning">
                You have enabled{' '}
                <ExternalLink href="https://en.wikipedia.org/wiki/Do_Not_Track">
                  do not track
                </ExternalLink>{' '}
                in your browser, so you will not be tracked until that option is disabled.
              </div>
            ) : (
              <div className="text-right">
                <Toggle
                  labels={['Allow', 'Opt out']}
                  isOn={this.state.allowTracking}
                  onChange={this.onToggleTracking}
                />
              </div>
            )}
          </div>
        </div>

        <br />

        <div className="row">
          <div className="col-md-8">
            <p>
              We use Disqus for comments. Disqus may load its own tracking code which we cannot
              control. To improve privacy you may opt to load Disqus only when you wish to see or
              read the comments.
            </p>
          </div>
          <div className="col-md-4 text-right">
            <Toggle
              labels={['Load Manually', 'Always Load']}
              isOn={this.props.loadDisqusManually === true}
              onChange={this.props.setLoadDisqusManually}
            />
          </div>
        </div>
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
  loadDisqusManually: state.settings.loadDisqusManually,
});

const connectedSettings = connect(
  mapStateToProps,
  {
    selectTheme,
    selectNewStudent,
    selectFaculty,
    selectMode,
    toggleBetaTesting,
    setLoadDisqusManually,
  },
)(SettingsContainer);

export default deferComponentRender(connectedSettings);
