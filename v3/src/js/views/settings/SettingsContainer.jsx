// @flow
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import deferComponentRender from 'views/hocs/deferComponentRender';
import classnames from 'classnames';
import Helmet from 'react-helmet';

import type { Faculty } from 'types/modules';
import type { Mode } from 'types/settings';
import type { CorsNotificationSettings } from 'types/reducers';
import type { State } from 'reducers';

import config from 'config';
import { selectTheme } from 'actions/theme';
import {
  selectNewStudent,
  selectFaculty,
  selectMode,
  dismissCorsNotification,
  enableCorsNotification,
  toggleCorsNotificationGlobally,
} from 'actions/settings';
import availableThemes from 'data/themes.json';
// import FacultySelect from 'views/components/FacultySelect';
// import NewStudentSelect from 'views/components/NewStudentSelect';
import ScrollToTop from 'views/components/ScrollToTop';
import Timetable from 'views/timetable/Timetable';
import CorsNotification, {
  corsNotificationText,
} from 'views/components/cors-info/CorsNotification';
import { currentRound } from 'utils/cors';
import { supportsCSSVariables } from 'utils/css';

import ThemeOption from './ThemeOption';
import ModeSelect from './ModeSelect';
import styles from './SettingsContainer.scss';
import previewTimetable from './previewTimetable';
import Toggle from '../Toggle';

type Props = {
  newStudent: boolean,
  faculty: Faculty,
  currentThemeId: string,
  mode: Mode,
  corsNotification: CorsNotificationSettings,

  selectTheme: Function,
  selectNewStudent: Function,
  selectFaculty: Function,
  selectMode: Function,

  dismissCorsNotification: Function,
  enableCorsNotification: Function,
  toggleCorsNotificationGlobally: Function,
};

function SettingsContainer(props: Props) {
  const corsRound = currentRound();
  const isSnoozed = corsRound && props.corsNotification.dismissed.includes(corsRound.round);
  const corsText = corsNotificationText(false);

  return (
    <div className={classnames(styles.settingsPage, 'page-container')}>
      <ScrollToTop onComponentWillMount />
      <Helmet>
        <title>Settings - {config.brandName}</title>
      </Helmet>

      <h1 className={styles.title}>Settings</h1>

      {/* TODO: Finish the CORS bidding stats filter feature and re-enable this
      <h4>New Student</h4>
      <div className={classnames(styles.toggleRow, 'row')}>
        <div className={classnames(styles.toggleDescription, 'col-sm-7')}>
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
      {supportsCSSVariables() && (
        <div>
          <h4>Night Mode</h4>
          <div className={classnames(styles.toggleRow, 'row')}>
            <div className={classnames(styles.toggleDescription, 'col-sm-7')}>
              <p>
                Night mode turns the light surfaces of the page dark, creating an experience ideal
                for the dark. Try it out!
              </p>
              <p>
                Protip: Press <kbd>X</kbd> to toggle modes anywhere on NUSMods.
              </p>
            </div>
            <div className={classnames('col-sm-4 offset-sm-1', styles.toggle)}>
              <ModeSelect mode={props.mode} onSelectMode={props.selectMode} />
            </div>
          </div>
          <hr />
        </div>
      )}

      <h4>Theme</h4>

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
            isSelected={props.currentThemeId === theme.id}
            onSelectTheme={props.selectTheme}
          />
        ))}
      </div>

      <hr />

      <h4>CORS Bidding Reminder</h4>

      <div className={styles.notificationPreview}>
        <CorsNotification hideCloseButton />
      </div>

      <div className={classnames(styles.toggleRow, 'row')}>
        <div className={classnames(styles.toggleDescription, 'col-sm-7')}>
          <p>You can get a reminder about when CORS bidding starts with a small notification.</p>
          {corsText && <p>{corsText}</p>}
        </div>
        <div className={classnames('col-sm-4 offset-sm-1', styles.toggle)}>
          <Toggle
            isOn={props.corsNotification.enabled}
            onChange={props.toggleCorsNotificationGlobally}
          />
        </div>
      </div>

      <hr />

      {props.corsNotification.enabled &&
        corsRound && (
          <Fragment>
            <div className={classnames(styles.toggleRow, 'row')}>
              <div className={classnames(styles.toggleDescription, 'col-sm-7')}>
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
                      ? props.enableCorsNotification(corsRound.round)
                      : props.dismissCorsNotification(corsRound.round)
                  }>
                  {isSnoozed ? 'Unsnooze' : 'Snooze'}
                </button>
              </div>
            </div>

            <hr />
          </Fragment>
        )}
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  newStudent: state.settings.newStudent,
  faculty: state.settings.faculty,
  mode: state.settings.mode,
  corsNotification: state.settings.corsNotification,
  currentThemeId: state.theme.id,
});

const connectedSettings = connect(mapStateToProps, {
  selectTheme,
  selectNewStudent,
  selectFaculty,
  selectMode,
  toggleCorsNotificationGlobally,
  dismissCorsNotification,
  enableCorsNotification,
})(SettingsContainer);
export default deferComponentRender(connectedSettings);
