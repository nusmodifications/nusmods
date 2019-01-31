// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import deferComponentRender from 'views/hocs/deferComponentRender';
import classnames from 'classnames';

import type { Faculty } from 'types/modules';
import type { Mode } from 'types/settings';
import type { CorsNotificationSettings } from 'types/reducers';
import type { State as StoreState } from 'reducers';

import availableThemes from 'data/themes.json';
import { selectTheme } from 'actions/theme';
import {
  selectNewStudent,
  selectFaculty,
  selectMode,
  dismissCorsNotification,
  enableCorsNotification,
  toggleCorsNotificationGlobally,
  toggleBetaTesting,
  setLoadDisqusManually,
} from 'actions/settings';
// import FacultySelect from 'views/components/FacultySelect';
// import NewStudentSelect from 'views/components/NewStudentSelect';
import ScrollToTop from 'views/components/ScrollToTop';
import Timetable from 'views/timetable/Timetable';
import Title from 'views/components/Title';
import Toggle from 'views/components/Toggle';

import CorsNotification, {
  corsNotificationText,
} from 'views/components/cors-info/CorsNotification';
import Online from 'views/components/Online';
import { currentRound } from 'utils/cors';
import { supportsCSSVariables } from 'utils/css';
import { withTracker } from 'bootstrapping/mamoto';
import ExternalLink from 'views/components/ExternalLink';

import ThemeOption from './ThemeOption';
import ModeSelect from './ModeSelect';
import styles from './SettingsContainer.scss';
import previewTimetable from './previewTimetable';
import BetaToggle from './BetaToggle';
import RefreshPrompt from './RefreshPrompt';

type Props = {
  newStudent: boolean,
  faculty: Faculty,
  currentThemeId: string,
  mode: Mode,
  corsNotification: CorsNotificationSettings,
  betaTester: boolean,
  loadDisqusManually: boolean,

  selectTheme: Function,
  selectNewStudent: Function,
  selectFaculty: Function,
  selectMode: Function,

  toggleBetaTesting: () => void,
  setLoadDisqusManually: (boolean) => void,
  dismissCorsNotification: Function,
  enableCorsNotification: Function,
  toggleCorsNotificationGlobally: Function,
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

  renderCorsNotitificationOption(corsRound) {
    const { corsNotification } = this.props;
    const isSnoozed = corsRound && corsNotification.dismissed.includes(corsRound.round);

    return (
      <Fragment>
        <div className={styles.toggleRow}>
          <div className={styles.toggleDescription}>
            <p>
              {isSnoozed
                ? 'You have snoozed reminders until the end of this round'
                : 'You can also temporarily snooze the notification until the end of this round.'}
            </p>
          </div>
          <div className={classnames('col-sm-4 offset-sm-1', styles.toggle)}>
            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={() =>
                isSnoozed
                  ? this.props.enableCorsNotification(corsRound.round)
                  : this.props.dismissCorsNotification(corsRound.round)
              }
            >
              {isSnoozed ? 'Unsnooze' : 'Snooze'}
            </button>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { corsNotification, currentThemeId } = this.props;

    const corsRound = currentRound();
    const corsText = corsNotificationText(false);

    return (
      <div className={classnames(styles.settingsPage, 'page-container')}>
        <ScrollToTop onComponentDidMount />
        <Title>Settings</Title>

        <Online>
          <RefreshPrompt />
        </Online>

        <h1 className={styles.title}>Settings</h1>
        <hr />

        {/* TODO: Finish the CORS bidding stats filter feature and re-enable this
      <h4>New Student</h4>
      <div className={styles.toggleRow}>
        <div className={styles.toggleDescription}>
          <p>For certain modules, places are reserved for new students in CORS Bidding Rounds
                1 and 2. Enabling this will highlight those numbers and rounds.</p>
        </div>
        <div className={classnames('col-sm-4 offset-sm-1 col-5', styles.toggle)}>
          <NewStudentSelect
            newStudent={props.newStudent}
            onSelectNewStudent={props.selectNewStudent}
          />
        </div>
      </div>
      <hr />

      <h4>Faculty</h4>
      <div className="row">
        <div className="col-sm-7">
          <p>Certain modules have places reserved for students in different faculties in rounds
                1 and 2. Selecting your faculty will highlight those numbers and rounds.</p>

          <p>CEG Students should select <strong>Joint Multi-Disciplinary Program</strong> due to the
                unique nature of their course.</p>
        </div>
        <div className="col-sm-4 offset-sm-1">
          <FacultySelect faculty={props.faculty} onChange={props.selectFaculty} />
        </div>
      </div>
      <hr />
      */}
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

        <h4 id="cors">CORS Bidding Reminder</h4>

        <div className={styles.notificationPreview}>
          <CorsNotification hideCloseButton />
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleDescription}>
            <p>You can get a reminder about when CORS bidding starts with a small notification.</p>
            {corsText && <p>{corsText}</p>}
          </div>
          <div className={styles.toggle}>
            <Toggle
              isOn={corsNotification.enabled}
              onChange={this.props.toggleCorsNotificationGlobally}
            />
          </div>
        </div>

        {corsNotification.enabled && corsRound && this.renderCorsNotitificationOption(corsRound)}

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
    toggleCorsNotificationGlobally,
    dismissCorsNotification,
    enableCorsNotification,
    toggleBetaTesting,
    setLoadDisqusManually,
  },
)(SettingsContainer);

export default deferComponentRender(connectedSettings);
