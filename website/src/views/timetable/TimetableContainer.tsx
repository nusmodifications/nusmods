import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import classnames from 'classnames';

import { ModuleCode, Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
import { ColorMapping, ModulesMap, NotificationOptions } from 'types/reducers';

import { selectSemester as selectSemesterAction } from 'actions/settings';
import { getSemesterTimetable } from 'selectors/timetables';
import {
  fetchTimetableModules as fetchTimetableModulesAction,
  setTimetable as setTimetableAction,
} from 'actions/timetables';
import { openNotification as openNotificationAction } from 'actions/app';
import { undo as undoAction } from 'actions/undoHistory';
import { getModuleCondensed } from 'selectors/moduleBank';
import { deserializeTimetable } from 'utils/timetables';
import { fillColorMapping } from 'utils/colors';
import { semesterForTimetablePage, TIMETABLE_SHARE, timetablePage } from 'views/routes/paths';
import { useHistory } from 'views/routes/hooks';
import { Repeat } from 'react-feather';
import SemesterSwitcher from 'views/components/semester-switcher/SemesterSwitcher';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ScrollToTop from 'views/components/ScrollToTop';
import { State as StoreState } from 'types/state';
import { EntryPointComponentProps } from 'views/routes/RoutingContext';
import TimetableContent from './TimetableContent';

import styles from './TimetableContainer.scss';

export type QueryParam = {
  action: string;
  semester: string;
};

type OwnProps = EntryPointComponentProps<unknown, QueryParam>;

type Props = OwnProps & {
  modules: ModulesMap;
  semester: Semester | null;
  activeSemester: Semester;
  timetable: SemTimetableConfig;
  colors: ColorMapping;

  isValidModule: (moduleCode: ModuleCode) => boolean;
  selectSemesterProp: (semester: Semester) => void;
  setTimetableProp: (
    semester: Semester,
    semTimetableConfig: SemTimetableConfig,
    colorMapping: ColorMapping,
  ) => void;
  fetchTimetableModulesProp: (semTimetableConfig: SemTimetableConfig[]) => void;
  openNotificationProp: (str: string, notificationOptions: NotificationOptions) => void;
  undoProp: () => void;
};

/**
 * Manages semester switching and sync/shared timetables
 * - Checks if the semester path param is valid and display a 404 page if it is not
 * - Import timetable data from query string if action is defined
 * - Create the UI for the user to confirm their actions
 */
export const TimetableContainerComponent = memo<Props>(
  ({
    match,

    modules,
    semester,
    activeSemester,
    timetable,
    colors,

    isValidModule,
    selectSemesterProp,
    setTimetableProp,
    fetchTimetableModulesProp,
    openNotificationProp,
    undoProp,
  }) => {
    const history = useHistory();
    const { location } = history;
    const { action } = match.params;

    const [importedTimetable, setImportedTimetable] = useState(() =>
      semester && action ? deserializeTimetable(location.search) : null,
    );

    useEffect(() => {
      // TODO: Preload this
      if (importedTimetable) {
        fetchTimetableModulesProp([importedTimetable]);
      }
    }, [fetchTimetableModulesProp, importedTimetable]);

    const selectSemester = useCallback(
      (selectedSemester: Semester) => {
        selectSemesterProp(selectedSemester);

        history.push({
          ...location,
          pathname: timetablePage(selectedSemester),
        });
      },
      [history, location, selectSemesterProp],
    );

    const isLoading = useMemo(() => {
      // Check that all modules are fully loaded into the ModuleBank
      const moduleCodes = new Set(Object.keys(timetable));
      if (importedTimetable) {
        Object.keys(importedTimetable)
          .filter(isValidModule)
          .forEach((moduleCode) => moduleCodes.add(moduleCode));
      }

      // TODO: Account for loading error
      return Array.from(moduleCodes).some((moduleCode) => !modules[moduleCode]);
    }, [importedTimetable, isValidModule, modules, timetable]);

    const clearImportedTimetable = useCallback(() => {
      if (semester) {
        setImportedTimetable(null);
        history.push(timetablePage(semester));
      }
    }, [history, semester]);

    const importTimetable = useCallback(
      (guaranteedSemester: Semester, sharedTimetable: SemTimetableConfig) => {
        const filledColors = fillColorMapping(sharedTimetable, colors);
        setTimetableProp(guaranteedSemester, sharedTimetable, filledColors);
        clearImportedTimetable();

        openNotificationProp('Timetable imported', {
          timeout: 12000,
          overwritable: true,
          action: {
            text: 'Undo',
            handler: undoProp,
          },
        });
      },
      [clearImportedTimetable, colors, openNotificationProp, setTimetableProp, undoProp],
    );

    const renderSharingHeader = useCallback(
      (guaranteedSemester: Semester, sharedTimetable: SemTimetableConfig) => {
        return (
          <div className={classnames('alert', 'alert-success', styles.importAlert)}>
            <Repeat />

            <div className={classnames('row', styles.row)}>
              <div className={classnames('col')}>
                <h3>This timetable was shared with you</h3>
                <p>
                  Clicking import will <strong>replace</strong> your saved timetable with the one
                  below.
                </p>
              </div>

              <div className={classnames('col-md-auto', styles.actions)}>
                <button
                  className="btn btn-success"
                  type="button"
                  onClick={() => importTimetable(guaranteedSemester, sharedTimetable)}
                >
                  Import
                </button>
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={clearImportedTimetable}
                >
                  Back to saved timetable
                </button>
              </div>
            </div>
          </div>
        );
      },
      [clearImportedTimetable, importTimetable],
    );

    const renderTimetableHeader = useCallback(
      (guaranteedSemester: Semester, readOnly?: boolean) => {
        return (
          <SemesterSwitcher
            semester={guaranteedSemester}
            onSelectSemester={selectSemester}
            readOnly={readOnly}
          />
        );
      },
      [selectSemester],
    );

    // 1. If the URL doesn't look correct, we'll direct the user to the home page
    if (semester == null || (action && action !== TIMETABLE_SHARE)) {
      return <Redirect to={timetablePage(activeSemester)} />;
    }

    // 2. If we are importing a timetable, check that all imported modules are
    //    loaded first, and display a spinner if they're not.
    if (isLoading) {
      return <LoadingSpinner />;
    }

    // 3. Construct the color map
    const displayedTimetable = importedTimetable || timetable;
    const filledColors = fillColorMapping(displayedTimetable, colors);

    // 4. If there is an imported timetable, we show the sharing header which
    //    asks the user if they want to import the shared timetable
    const header = importedTimetable ? (
      <>
        {renderSharingHeader(semester, importedTimetable)}
        {renderTimetableHeader(semester, true)}
      </>
    ) : (
      renderTimetableHeader(semester)
    );

    return (
      <div>
        <ScrollToTop onComponentDidMount />

        <TimetableContent
          key={semester}
          semester={semester}
          timetable={displayedTimetable}
          colors={filledColors}
          header={header}
          readOnly={!!importedTimetable}
        />
      </div>
    );
  },
);

const mapStateToProps = (state: StoreState, ownProps: OwnProps) => {
  const semester = semesterForTimetablePage(ownProps.match.params.semester);
  const { timetable, colors } = semester
    ? getSemesterTimetable(semester, state.timetables)
    : { timetable: {}, colors: {} };
  const getModule = getModuleCondensed(state.moduleBank);

  return {
    semester,
    timetable,
    colors,
    isValidModule: (moduleCode: ModuleCode) => !!getModule(moduleCode),
    modules: state.moduleBank.modules,
    activeSemester: state.app.activeSemester,
  };
};

// Explicitly declare top level components for React hot reloading to work.
const connectedTimetableContainer = connect(mapStateToProps, {
  selectSemesterProp: selectSemesterAction,
  setTimetableProp: setTimetableAction,
  fetchTimetableModulesProp: fetchTimetableModulesAction,
  openNotificationProp: openNotificationAction,
  undoProp: undoAction,
})(TimetableContainerComponent);

export default connectedTimetableContainer;
