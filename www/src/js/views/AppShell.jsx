// @flow
import type { Node } from 'react';
import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { ModuleList } from 'types/reducers';
import type { Semester } from 'types/modules';
import type { Mode } from 'types/settings';
import type { State } from 'reducers';

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { NavLink, withRouter, type ContextRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { each } from 'lodash';
import weekText from 'utils/weekText';
import { fetchModuleList } from 'actions/moduleBank';
import {
  fetchTimetableModules,
  fillTimetableBlanks,
  setTimetable,
  migrateTimetable,
} from 'actions/timetables';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
import Notification from 'views/components/Notification';
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

export class AppShellComponent extends Component<Props> {
  componentWillMount() {
    const { timetables } = this.props;

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

  render() {
    // TODO: Handle failed loading of module list
    const isModuleListReady = this.props.moduleList.length;
    const isDarkMode = this.props.mode === DARK_MODE;

    return (
      <div className="app-container">
        <Helmet>
          <body
            className={classnames(`theme-${this.props.theme}`, {
              'mode-dark': isDarkMode,
              'mdc-theme--dark': isDarkMode,
            })}
          />
        </Helmet>

        <nav className={styles.navbar}>
          <NavLink className={styles.brand} to="/" title="Home">
            <span className="sr-only">NUSMods</span>
          </NavLink>
          <GlobalSearchContainer />
          <div className={styles.weekText}>{weekText}</div>
        </nav>

        <div className="main-container">
          <Navtabs />

          <main className="main-content">
            {isModuleListReady ? this.props.children : <LoadingSpinner />}
          </main>
        </div>

        <FeedbackModal />

        <Notification />

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
})(AppShellComponent);

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(connectedAppShell);
