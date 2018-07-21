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
  validateTimetable,
  setTimetable,
  migrateTimetable,
} from 'actions/timetables';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
import Notification from 'views/components/Notification';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';
import { DARK_MODE } from 'types/settings';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackModal from './components/FeedbackModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';
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
  validateTimetable: (Semester) => void,
};

export class AppShellComponent extends Component<Props> {
  componentDidMount() {
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
    each(timetables, (timetable, semesterString) => {
      const semester = Number(semesterString);

      this.props
        .fetchTimetableModules([timetable])
        .then(() => this.props.validateTimetable(semester));
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

          <ErrorBoundary>
            <GlobalSearchContainer />
          </ErrorBoundary>

          <div className={styles.weekText}>{weekText}</div>
        </nav>
        <div className="main-container">
          <Navtabs />

          <main className="main-content">
            {isModuleListReady ? (
              <ErrorBoundary errorPage={(error, eventId) => <ErrorPage eventId={eventId} />}>
                {this.props.children}
              </ErrorBoundary>
            ) : (
              <LoadingSpinner />
            )}
          </main>
        </div>

        <ErrorBoundary>
          <FeedbackModal />
        </ErrorBoundary>

        <ErrorBoundary>
          <Notification />
        </ErrorBoundary>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>

        <ErrorBoundary>
          <KeyboardShortcuts />
        </ErrorBoundary>
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
  validateTimetable,
})(AppShellComponent);

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(connectedAppShell);
