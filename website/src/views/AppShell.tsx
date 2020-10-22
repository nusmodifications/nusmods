import React, { Suspense, useCallback, useContext, useEffect } from 'react';
import { SemTimetableConfig, TimetableConfig } from 'types/timetables';
import { ModuleList, NotificationOptions } from 'types/reducers';
import { Semester } from 'types/modules';
import { DARK_MODE, Mode } from 'types/settings';

import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { each } from 'lodash';
import { useLocation } from 'react-router-dom';

import weekText from 'utils/weekText';
import { captureException } from 'utils/error';
import { openNotification as openNotificationAction } from 'actions/app';
import {
  fetchTimetableModules as fetchTimetableModulesAction,
  validateTimetable as validateTimetableAction,
} from 'actions/timetables';
import Footer from 'views/layout/Footer';
import Navtabs from 'views/layout/Navtabs';
import GlobalSearchContainer from 'views/layout/GlobalSearchContainer';
import Notification from 'views/components/notfications/Notification';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import { PreloadingNavLink } from 'views/routes/PreloadingLink';
import ErrorPage from 'views/errors/ErrorPage';
import ApiError from 'views/errors/ApiError';
import { trackPageView } from 'bootstrapping/matomo';
import { isIOS } from 'bootstrapping/browser';
import Logo from 'img/nusmods-logo.svg';
import { State as StoreState } from 'types/state';
import type { JSResource } from 'utils/JSResource';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackModal from './components/FeedbackModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';

import styles from './AppShell.scss';

type Props = {
  children: React.ReactNode;

  // From router
  prepared: {
    moduleList: JSResource<unknown>;
  };

  // From Redux state
  moduleList: ModuleList;
  timetables: TimetableConfig;
  theme: string;
  mode: Mode;

  // From Redux actions
  fetchTimetableModulesProp: (semTimetableConfig: SemTimetableConfig[]) => Promise<unknown>;
  validateTimetable: (semester: Semester) => void;
  openNotification: (str: string, notificationOptions?: NotificationOptions) => void;
};

export const AppShellComponent: React.FC<Props> = ({
  children,

  prepared,

  moduleList,
  timetables,
  theme,
  mode,

  fetchTimetableModulesProp,
  validateTimetable,
  openNotification,
}) => {
  const location = useLocation();

  // Enable Matomo analytics
  // const router = useContext(RoutingContext);
  // useEffect(() => {
  //   if (router) {
  //     // Unsubscribe when router changes or on unmount
  //     return trackPageView(router.history);
  //   }
  //   return undefined;
  // }, [router]);

  const fetchTimetableModules = useCallback(
    (timetable: SemTimetableConfig, semester: Semester) => {
      fetchTimetableModulesProp([timetable])
        .then(() => validateTimetable(semester))
        .catch((error) => {
          captureException(error);
          openNotification('Data for some modules failed to load', {
            action: {
              text: 'Retry',
              handler: () => fetchTimetableModules(timetable, semester),
            },
          });
        });
    },
    [fetchTimetableModulesProp, openNotification, validateTimetable],
  );

  useEffect(
    () => {
      // Fetch the module data of the existing modules in the timetable and ensure all
      // lessons are filled
      each(timetables, (timetable, semesterString) => {
        const semester = Number(semesterString);
        prepared.moduleList.preload().then(() => {
          // Wait for module list to be fetched before trying to fetch timetable modules
          // TODO: There may be a more optimal way to do this
          fetchTimetableModules(timetable, semester);
        });
      });
    },
    // Only run this once, on component mount. Don't care if props change after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const isModuleListReady = moduleList.length;
  const isDarkMode = mode === DARK_MODE;

  return (
    <div className="app-container">
      <Helmet>
        <body
          className={classnames(`theme-${theme}`, {
            'mode-dark': isDarkMode,
            'mdc-theme--dark': isDarkMode,
            'mobile-safari': isIOS,
          })}
        />
      </Helmet>

      <nav className={styles.navbar}>
        <PreloadingNavLink className={styles.brand} to="/" title="Home">
          <Logo className={styles.brandLogo} title="NUSMods" />
        </PreloadingNavLink>

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
          {/* FIXME: Create error page that switches between network errors
          and other (unexpected) errors. <ErrorPage showReportDialog /> */}
          {isModuleListReady ? (
            <ErrorBoundary
              key={location.pathname}
              errorPage={() => <ApiError dataName="the page" />}
            >
              <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
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
};

const mapStateToProps = (state: StoreState) => ({
  moduleList: state.moduleBank.moduleList,
  timetables: state.timetables.lessons,
  theme: state.theme.id,
  mode: state.settings.mode,
});

const connectedAppShell = connect(
  mapStateToProps,
  {
    fetchTimetableModulesProp: fetchTimetableModulesAction,
    validateTimetable: validateTimetableAction,
    openNotification: openNotificationAction,
  },
  // TODO: Patch types for Redux for request-middleware
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
)(AppShellComponent as any);

// withRouter here is used to ensure re-render when routes change, since
// connect implements shouldComponentUpdate based purely on props. If it
// is removed, connect not detect prop changes when route is changed and
// thus the pages are not re-rendered
// export default withRouter(connectedAppShell);
export default connectedAppShell;
