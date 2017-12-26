// @flow
import type { Node } from 'react';
import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { ModuleList } from 'types/reducers';
import type { Semester } from 'types/modules';
import type { Mode } from 'types/settings';

import React, { Component } from 'react';
import { NavLink, withRouter, type ContextRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';
import classnames from 'classnames';
import { values } from 'lodash';

import { fetchModuleList } from 'actions/moduleBank';
import { fetchTimetableModules, setTimetable, migrateTimetable } from 'actions/timetables';
import { noBreak } from 'utils/react';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import { DARK_MODE } from 'types/settings';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackModal from './components/FeedbackModal';
import styles from './AppShell.scss';

type Props = {
  ...ContextRouter,

  children: Node,
  moduleList: ModuleList,
  timetables: TimetableConfig,
  theme: string,
  mode: Mode,
  activeSemester: Semester,

  fetchModuleList: () => void,
  migrateTimetable: () => void,
  fetchTimetableModules: (SemTimetableConfig[]) => void,
  setTimetable: (Semester, SemTimetableConfig) => void,
};

// Put outside render because this only needs to computed on page load.
const weekText = (() => {
  const acadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  const parts = [`AY20${acadWeekInfo.year}`];

  // Check for null value (ie. during vacation)
  if (acadWeekInfo.sem) {
    parts.push(noBreak(acadWeekInfo.sem));
  }

  // Hide semester if semester type is 'Instructional'
  if (acadWeekInfo.type !== 'Instructional') {
    parts.push(noBreak(`${acadWeekInfo.type} Week`));
  }

  // Do not show the week number if there is only one week, e.g. recess
  if (acadWeekInfo.num > 0) {
    parts.push(noBreak(`Week ${acadWeekInfo.num}`));
  }

  return parts.join(', ');
})();

function setMode(mode: Mode) {
  if (!document.body) {
    return;
  }

  if (mode === DARK_MODE) {
    document.body.classList.add('mode-dark');
  } else {
    document.body.classList.remove('mode-dark');
  }
}

export class AppShell extends Component<Props> {
  componentWillMount() {
    const { mode, timetables } = this.props;
    setMode(mode);

    // Retrieve module list
    // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
    this.props.fetchModuleList();

    // Fetch all module data that are on timetable
    this.props.fetchTimetableModules(values(timetables));

    // Handle migration from v2
    // TODO: Remove this once sem 2 is over
    this.props.migrateTimetable();
  }

  componentWillUpdate(nextProps: Props) {
    setMode(nextProps.mode);
  }

  render() {
    // TODO: Handle failed loading of module list
    const isModuleListReady = this.props.moduleList.length;

    return (
      <div className="app-container">
        <nav className={styles.navbar}>
          <NavLink className={styles.brand} to="/" title="Home">
            <span className="sr-only">NUSMods</span>
          </NavLink>
          <span className="nm-navbar-text"><small>{weekText}</small></span>
        </nav>

        <div className="main-container">
          <Navtabs />

          <main className={classnames('main-content', `theme-${this.props.theme}`)}>
            {isModuleListReady ? this.props.children : <LoadingSpinner />}
          </main>
        </div>

        <FeedbackModal />

        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  moduleList: state.entities.moduleBank.moduleList,
  timetables: state.timetables,
  theme: state.theme.id,
  mode: state.settings.mode,
  activeSemester: state.app.activeSemester,
});

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(
  connect(mapStateToProps, {
    fetchModuleList,
    fetchTimetableModules,
    setTimetable,
    migrateTimetable,
  })(AppShell),
);
