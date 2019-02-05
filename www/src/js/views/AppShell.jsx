// @flow
import type { Node } from 'react';
import type { TimetableConfig, SemTimetableConfig } from 'types/timetables';
import type { ModuleList, NotificationOptions } from 'types/reducers';
import type { Semester } from 'types/modules';
import type { Mode } from 'types/settings';
import type { State as StoreState } from 'reducers';

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { NavLink, withRouter, type ContextRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { each } from 'lodash';

import weekText from 'utils/weekText';
import { isMobileIos } from 'utils/css';
import { captureException } from 'utils/error';
import { openNotification } from 'actions/app';
import { fetchModuleList } from 'actions/moduleBank';
import { fetchTimetableModules, validateTimetable, setTimetable } from 'actions/timetables';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
import Notification from 'views/components/notfications/Notification';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';
import ApiError from 'views/errors/ApiError';
import { trackPageView } from 'bootstrapping/mamoto';
import { DARK_MODE } from 'types/settings';
import Logo from 'img/nusmods-logo.svg';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackModal from './components/FeedbackModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import styles from './AppShell.scss';

type Props = {
  ...ContextRouter,

  children: Node,

  // From Redux state
  moduleList: ModuleList,
  timetables: TimetableConfig,
  theme: string,
  mode: Mode,
  activeSemester: Semester,

  // From Redux actions
  fetchModuleList: () => Promise<*>,
  fetchTimetableModules: (SemTimetableConfig[]) => Promise<*>,
  setTimetable: (Semester, SemTimetableConfig) => void,
  validateTimetable: (Semester) => void,
  openNotification: (string, ?NotificationOptions) => void,
};

type State = {
  moduleListError?: any,
};

export class AppShellComponent extends Component<Props, State> {
  state = {};

  componentDidMount() {
    const { timetables } = this.props;

    // Retrieve module list
    this.fetchModuleList();

    // Fetch the module data of the existing modules in the timetable and ensure all
    // lessons are filled
    each(timetables, (timetable, semesterString) => {
      const semester = Number(semesterString);
      this.fetchTimetableModules(timetable, semester);
    });

    // Enable Mamoto analytics
    trackPageView(this.props.history);
  }

  isMobileIos = isMobileIos();

  fetchModuleList = () => {
    // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
    this.props.fetchModuleList().catch((error) => {
      captureException(error);
      this.setState({ moduleListError: error });
    });
  };

  fetchTimetableModules = (timetable: SemTimetableConfig, semester: Semester) => {
    this.props
      .fetchTimetableModules([timetable])
      .then(() => this.props.validateTimetable(semester))
      .catch((error) => {
        captureException(error);
        this.props.openNotification('Data for some modules failed to load', {
          action: {
            text: 'Retry',
            handler: () => this.fetchTimetableModules(timetable, semester),
          },
        });
      });
  };

  render() {
    const isModuleListReady = this.props.moduleList.length;
    const isDarkMode = this.props.mode === DARK_MODE;

    if (!isModuleListReady && this.state.moduleListError) {
      return <ApiError dataName="module information" retry={this.fetchModuleList} />;
    }

    return (
      <div className="app-container">
        <Helmet>
          <body
            className={classnames(`theme-${this.props.theme}`, {
              'mode-dark': isDarkMode,
              'mdc-theme--dark': isDarkMode,
              'mobile-safari': this.isMobileIos,
            })}
          />
        </Helmet>

        <nav className={styles.navbar}>
          <NavLink className={styles.brand} to="/" title="Home">
            <Logo title="NUSMods" />
          </NavLink>

          <div className={styles.navRight}>
            <ErrorBoundary>
              <GlobalSearchContainer />
            </ErrorBoundary>

            <div className={styles.weekText}>{weekText}</div>
          </div>
        </nav>

        <div className="main-container">
          <Navtabs />

          <main className="main-content">
            {isModuleListReady ? (
              <ErrorBoundary errorPage={() => <ErrorPage showReportDialog />}>
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

const mapStateToProps = (state: StoreState) => ({
  moduleList: state.moduleBank.moduleList,
  timetables: state.timetables.lessons,
  theme: state.theme.id,
  mode: state.settings.mode,
  activeSemester: state.app.activeSemester,
});

const connectedAppShell = connect(
  mapStateToProps,
  {
    fetchModuleList,
    fetchTimetableModules,
    setTimetable,
    validateTimetable,
    openNotification,
  },
)(AppShellComponent);

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(connectedAppShell);
