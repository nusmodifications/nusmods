// @flow
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Helmet from 'react-helmet';

import type { Faculty } from 'types/modules';
import type { Mode } from 'types/settings';

import config from 'config';
import { selectTheme } from 'actions/theme';
import { selectNewStudent, selectFaculty, selectMode } from 'actions/settings';
import availableThemes from 'data/themes.json';
import FacultySelect from 'views/components/FacultySelect';
import NewStudentSelect from 'views/components/NewStudentSelect';
import Timetable from 'views/timetable/Timetable';
import { supportsCSSVariables } from 'utils/react';

import ThemeOption from './ThemeOption';
import ModeSelect from './ModeSelect';
import styles from './SettingsContainer.scss';
import previewTimetable from './previewTimetable';

type Props = {
  newStudent: boolean,
  faculty: Faculty,
  currentThemeId: string,
  mode: Mode,

  selectTheme: Function,
  selectNewStudent: Function,
  selectFaculty: Function,
  selectMode: Function,
};

function SettingsContainer(props: Props) {
  return (
    <div className={classnames(styles.settingsPage, 'page-container')}>
      <Helmet>
        <title>Settings - {config.brandName}</title>
      </Helmet>

      <h1 className={styles.title}>Settings</h1>

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

      {supportsCSSVariables() &&
      <div>
        <h4>Night Mode</h4>
        <div className={classnames(styles.toggleRow, 'row')}>
          <div className={classnames(styles.toggleDescription, 'col-sm-7')}>
            <p>Night mode turns the light surfaces of the page dark, creating an
                    experience ideal for the dark. Try it out!</p>
          </div>
          <div className={classnames('col-sm-4 offset-sm-1', styles.toggle)}>
            <ModeSelect mode={props.mode} onSelectMode={props.selectMode} />
          </div>
        </div>
        <hr />
      </div>}

      <h4>Theme</h4>

      <p>Liven up your timetable with different color schemes!</p>

      <div className={styles.preview}>
        <Timetable lessons={previewTimetable} />
      </div>

      <div className="theme-options">
        {availableThemes.map(theme => (
          <ThemeOption
            key={theme.id}
            className={styles.themeOption}
            theme={theme}
            isSelected={props.currentThemeId === theme.id}
            onSelectTheme={props.selectTheme}
          />
        ))}
      </div>

    </div>
  );
}

const mapStateToProps = state => ({
  newStudent: state.settings.newStudent,
  faculty: state.settings.faculty,
  mode: state.settings.mode,
  currentThemeId: state.theme.id,
});

export default connect(
  mapStateToProps,
  {
    selectTheme,
    selectNewStudent,
    selectFaculty,
    selectMode,
  },
)(SettingsContainer);
