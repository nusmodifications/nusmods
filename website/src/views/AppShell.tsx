import * as React from 'react';
import { SemTimetableConfig, TimetableConfig } from 'types/timetables';
import { ModuleList, NotificationOptions } from 'types/reducers';
import { Semester } from 'types/modules';
import { DARK_MODE, Mode } from 'types/settings';

import { Helmet } from 'react-helmet';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { each } from 'lodash';

import weekText from 'utils/weekText';
import { captureException } from 'utils/error';
import { openNotification } from 'actions/app';
import { fetchModuleList } from 'actions/moduleBank';
import { fetchTimetableModules, setTimetable, validateTimetable } from 'actions/timetables';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
import Notification from 'views/components/notfications/Notification';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ErrorPage from 'views/errors/ErrorPage';
import ApiError from 'views/errors/ApiError';
import { trackPageView } from 'bootstrapping/matomo';
import { isIOS } from 'bootstrapping/browser';
import Logo from 'img/nusmods-logo.svg';
import { State as StoreState } from 'types/state';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackModal from './components/FeedbackModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';

import styles from './AppShell.scss';

type Props = RouteComponentProps & {
  children: React.ReactNode;

  // From Redux state
  moduleList: ModuleList;
  timetables: TimetableConfig;
  theme: string;
  mode: Mode;
  activeSemester: Semester;

  // From Redux actions
  fetchModuleList: () => Promise<unknown>; // Typed as unknown because we don't actually need the output
  fetchTimetableModules: (semTimetableConfig: SemTimetableConfig[]) => Promise<unknown>;
  setTimetable: (semester: Semester, semTimetableConfig: SemTimetableConfig) => void;
  validateTimetable: (semester: Semester) => void;
  openNotification: (str: string, notificationOptions?: NotificationOptions) => void;
};

type State = {
  moduleListError?: Error;
};

export class AppShellComponent extends React.Component<Props, State> {
  state: State = {};

  componentDidMount() {
    const { timetables } = this.props;

    // Retrieve module list
    const moduleList = this.fetchModuleList();

    // Fetch the module data of the existing modules in the timetable and ensure all
    // lessons are filled
    each(timetables, (timetable, semesterString) => {
      const semester = Number(semesterString);
      moduleList.then(() => {
        // Wait for module list to be fetched before trying to fetch timetable modules
        // TODO: There may be a more optimal way to do this
        this.fetchTimetableModules(timetable, semester);
      });
    });

    // Enable Matomo analytics
    trackPageView(this.props.history);
  }

  fetchModuleList = () =>
    // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
    this.props.fetchModuleList().catch((error) => {
      captureException(error);
      this.setState({ moduleListError: error });
    });

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
              'mobile-safari': isIOS,
            })}
          />
        </Helmet>

        <nav className={styles.navbar}>
          <NavLink className={styles.brand} to="/" title="Home">
            <Logo className={styles.brandLogo} title="NUSMods" />
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
  // TODO: Patch types for Redux for request-middleware
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
)(AppShellComponent as any);

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
export default withRouter(connectedAppShell);
