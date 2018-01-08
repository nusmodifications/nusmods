// @flow
import type { Node } from 'react';
import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { ModuleList } from 'types/reducers';
import type { Semester } from 'types/modules';
import type { Mode } from 'types/settings';
import type { State } from 'reducers';

import React, { Component } from 'react';
import { NavLink, withRouter, type ContextRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import NUSModerator from 'nusmoderator';
import classnames from 'classnames';
import { each } from 'lodash';

import { fetchModuleList } from 'actions/moduleBank';
import {
  fetchTimetableModules,
  fillTimetableBlanks,
  setTimetable,
  migrateTimetable,
} from 'actions/timetables';
import { noBreak } from 'utils/react';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
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

  fetchModuleList: () => Promise<*>,
  migrateTimetable: () => void,
  fetchTimetableModules: (SemTimetableConfig[]) => Promise<*>,
  setTimetable: (Semester, SemTimetableConfig) => void,
  fillTimetableBlanks: Semester => void,
};

type AcadWeekInfo = {
  year: string,
  sem: 'Semester 1' | 'Semester 2' | 'Special Sem 1' | 'Special Sem 2',
  type: 'Instructional' | 'Reading' | 'Examination' | 'Recess' | 'Vacation' | 'Orientation',
  num: ?number,
};

// Put outside render because this only needs to computed on page load.
const weekText = (() => {
  const acadWeekInfo: AcadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  const parts: Array<string> = [`AY20${acadWeekInfo.year}`];

  // Check for null value (ie. during vacation)
  if (acadWeekInfo.sem) {
    parts.push(noBreak(acadWeekInfo.sem));
  }

  // Hide week if week type is 'Instructional'
  if (acadWeekInfo.type !== 'Instructional') {
    // Do not show the week number if there is only one week, e.g. recess
    const weekNumber = acadWeekInfo.num || '';
    parts.push(noBreak(`${acadWeekInfo.type} Week ${weekNumber}`));
  }

  return parts.join(', ').trim();
})();

function setMode(mode: Mode) {
  if (!document.body) return;
  document.body.classList.toggle('mode-dark', mode === DARK_MODE);
}

export class AppShell extends Component<Props> {
  componentWillMount() {
    const { mode, timetables } = this.props;
    setMode(mode);

    // Retrieve module list
    // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
    this.props
      .fetchModuleList()
      // Handle migration from v2
      // TODO: Remove this once sem 2 is over
      .then(() => this.props.migrateTimetable());

    // Refresh the module data of the existing modules in the timetable and ensure all
    // lessons are filled
    each(timetables, (timetable, semester) => {
      this.props
        .fetchTimetableModules([timetable])
        .then(() => this.props.fillTimetableBlanks(Number(semester)));
    });

    // Fetch all module data that are on timetable
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
          <GlobalSearchContainer />
          <div className={styles.weekText}>{weekText}</div>
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

const mapStateToProps = (state: State) => ({
  moduleList: state.moduleBank.moduleList,
  timetables: state.timetables.lessons,
  theme: state.theme.id,
  mode: state.settings.mode,
  activeSemester: state.app.activeSemester,
});

const connectedAppShell = connect(mapStateToProps, {
  fetchModuleList,
  fetchTimetableModules,
  setTimetable,
  migrateTimetable,
  fillTimetableBlanks,
})(AppShell);

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(connectedAppShell);
