import { useCallback, useEffect, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';
import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';
import { DARK_COLOR_SCHEME } from 'types/settings';

import { Helmet } from 'react-helmet';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import classnames from 'classnames';
import { each } from 'lodash';

import weekText from 'utils/weekText';
import { captureException } from 'utils/error';
import { openNotification } from 'actions/app';
import { fetchModuleList as fetchModuleListAction } from 'actions/moduleBank';
import {
  fetchTimetableModules as fetchTimetableModulesAction,
  validateTimetable,
} from 'actions/timetables';
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
import type { Dispatch } from 'types/redux';
import type { State } from 'types/state';
import type { Actions } from 'types/actions';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackModal from './components/FeedbackModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';

import styles from './AppShell.scss';
import useColorScheme from './hooks/useColorScheme';

/**
 * Fetch module list on mount.
 */
function useFetchModuleListAndTimetableModules(): {
  moduleListError: Error | null;
  refetchModuleListAndTimetableModules: () => void;
} {
  const [moduleListError, setModuleListError] = useState<Error | null>(null);

  const dispatch = useDispatch<Dispatch>();
  const store = useStore<State, Actions>();

  const fetchModuleList = useCallback(
    () =>
      // TODO: This always re-fetch the entire modules list. Consider a better strategy for this
      dispatch(fetchModuleListAction()).catch((error) => {
        captureException(error);
        setModuleListError(error);
      }),
    [dispatch],
  );

  const fetchTimetableModules = useCallback(
    function fetchTimetableModulesImpl(timetable: SemTimetableConfig, semester: Semester) {
      dispatch(fetchTimetableModulesAction([timetable]))
        .then(() => dispatch(validateTimetable(semester)))
        .catch((error) => {
          captureException(error);
          dispatch(
            openNotification('Data for some courses failed to load', {
              action: {
                text: 'Retry',
                handler: () => fetchTimetableModulesImpl(timetable, semester),
              },
            }),
          );
        });
    },
    [dispatch],
  );

  const fetchModuleListAndTimetableModules = useCallback(() => {
    // Retrieve module list
    const moduleListPromise = fetchModuleList();

    // Fetch the module data of the existing modules in the timetable and ensure all
    // lessons are filled
    const timetables = store.getState().timetables.lessons;
    each(timetables, (timetable, semesterString) => {
      const semester = Number(semesterString);
      moduleListPromise.then(() => {
        // Wait for module list to be fetched before trying to fetch timetable modules
        // TODO: There may be a more optimal way to do this
        fetchTimetableModules(timetable, semester);
      });
    });
  }, [fetchModuleList, fetchTimetableModules, store]);

  useEffect(() => fetchModuleListAndTimetableModules(), [fetchModuleListAndTimetableModules]);

  return {
    moduleListError,
    refetchModuleListAndTimetableModules: fetchModuleListAndTimetableModules,
  };
}

const AppShell: FC<PropsWithChildren> = ({ children }) => {
  const { moduleListError, refetchModuleListAndTimetableModules } =
    useFetchModuleListAndTimetableModules();

  // Enable Matomo analytics
  const history = useHistory();
  useEffect(() => trackPageView(history), [history]);

  const moduleList = useSelector((state: State) => state.moduleBank.moduleList);
  const isModuleListReady = moduleList.length;

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === DARK_COLOR_SCHEME;

  const theme = useSelector((state: State) => state.theme.id);

  if (!isModuleListReady && moduleListError) {
    return <ApiError dataName="course information" retry={refetchModuleListAndTimetableModules} />;
  }

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
              {children}
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

export default AppShell;
