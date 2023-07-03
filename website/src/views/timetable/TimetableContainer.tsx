import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory, useLocation, useParams } from 'react-router-dom';
import { Repeat } from 'react-feather';
import classnames from 'classnames';

import type { ModuleCode, Semester } from 'types/modules';
import type { ColorMapping } from 'types/reducers';
import type { State } from 'types/state';
import type { SemTimetableConfig } from 'types/timetables';

import { selectSemester } from 'actions/settings';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { fetchTimetableModules, setTimetable } from 'actions/timetables';
import { openNotification } from 'actions/app';
import { undo } from 'actions/undoHistory';
import { getModuleCondensed } from 'selectors/moduleBank';
import { deserializeTimetable } from 'utils/timetables';
import { fillColorMapping } from 'utils/colors';
import { semesterForTimetablePage, TIMETABLE_SHARE, timetablePage } from 'views/routes/paths';
import deferComponentRender from 'views/hocs/deferComponentRender';
import SemesterSwitcher from 'views/components/semester-switcher/SemesterSwitcher';
import LoadingSpinner from 'views/components/LoadingSpinner';
import useScrollToTop from 'views/hooks/useScrollToTop';
import TimetableContent from './TimetableContent';

import styles from './TimetableContainer.scss';

type Params = {
  action: string;
  semester: string;
};

/*
 * If there is an imported timetable, show a sharing header which asks the user
 * if they want to import the shared timetable.
 */
const SharingHeader: FC<{
  semester: Semester;
  filledColors: ColorMapping;
  importedTimetable: SemTimetableConfig | null;
  setImportedTimetable: (timetable: SemTimetableConfig | null) => void;
}> = ({ semester, filledColors, importedTimetable, setImportedTimetable }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const clearImportedTimetable = useCallback(() => {
    if (semester) {
      setImportedTimetable(null);
      history.push(timetablePage(semester)); // TODO: Check that this works
    }
  }, [history, semester, setImportedTimetable]);

  const importTimetable = useCallback(() => {
    if (!importedTimetable) {
      return;
    }
    dispatch(setTimetable(semester, importedTimetable, filledColors));
    clearImportedTimetable();
    dispatch(
      openNotification('Timetable imported', {
        timeout: 12000,
        overwritable: true,
        action: {
          text: 'Undo',
          handler: () => dispatch(undo) as never,
        },
      }),
    );
  }, [clearImportedTimetable, dispatch, filledColors, importedTimetable, semester]);

  if (!importedTimetable) {
    return null;
  }

  return (
    <div className={classnames('alert', 'alert-success', styles.importAlert)}>
      <Repeat />

      <div className={classnames('row', styles.row)}>
        <div className={classnames('col')}>
          <h3>This timetable was shared with you</h3>
          <p>
            Clicking import will <strong>replace</strong> your saved timetable with the one below.
          </p>
        </div>

        <div className={classnames('col-md-auto', styles.actions)}>
          <button className="btn btn-success" type="button" onClick={importTimetable}>
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
};

const TimetableHeader: FC<{
  semester: Semester;
  readOnly?: boolean;
}> = ({ semester, readOnly }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleSelectSemester = useCallback(
    (newSemester: Semester) => {
      dispatch(selectSemester(newSemester));
      history.push({
        ...history.location,
        pathname: timetablePage(newSemester),
      });
    },
    [dispatch, history],
  );

  return (
    <SemesterSwitcher
      semester={semester}
      onSelectSemester={handleSelectSemester}
      readOnly={readOnly}
    />
  );
};

/**
 * Manages semester switching and sync/shared timetables
 * - Checks if the semester path param is valid and display a 404 page if it is not
 * - Import timetable data from query string if action is defined
 * - Create the UI for the user to confirm their actions
 */
export const TimetableContainerComponent: FC = () => {
  const params = useParams<Params>();

  const semester = semesterForTimetablePage(params.semester);

  const timetable = useSelector(getSemesterTimetableLessons)(semester);
  const colors = useSelector(getSemesterTimetableColors)(semester);
  const getModule = useSelector(getModuleCondensed);
  const modules = useSelector(({ moduleBank }: State) => moduleBank.modules);
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);

  const location = useLocation();
  const [importedTimetable, setImportedTimetable] = useState(() =>
    semester && params.action ? deserializeTimetable(location.search) : null,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (importedTimetable) {
      dispatch(fetchTimetableModules([importedTimetable]));
    }
  }, [dispatch, importedTimetable]);

  const isLoading = useMemo(() => {
    // Check that all modules are fully loaded into the ModuleBank
    const isValidModule = (moduleCode: ModuleCode) => !!getModule(moduleCode);
    const moduleCodes = new Set(Object.keys(timetable));
    if (importedTimetable) {
      Object.keys(importedTimetable)
        .filter(isValidModule)
        .forEach((moduleCode) => moduleCodes.add(moduleCode));
    }
    // TODO: Account for loading error
    return Array.from(moduleCodes).some((moduleCode) => !modules[moduleCode]);
  }, [getModule, importedTimetable, modules, timetable]);

  const displayedTimetable = importedTimetable || timetable;
  const filledColors = useMemo(
    () => fillColorMapping(displayedTimetable, colors),
    [colors, displayedTimetable],
  );
  const readOnly = displayedTimetable === importedTimetable;

  useScrollToTop();

  // 1. If the URL doesn't look correct, we'll direct the user to the home page
  if (semester == null || (params.action && params.action !== TIMETABLE_SHARE)) {
    return <Redirect to={timetablePage(activeSemester)} />;
  }

  // 2. If we are importing a timetable, check that all imported modules are
  //    loaded first, and display a spinner if they're not.
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <TimetableContent
      key={semester}
      semester={semester}
      timetable={displayedTimetable}
      colors={filledColors}
      header={
        <>
          <SharingHeader
            semester={semester}
            filledColors={filledColors}
            importedTimetable={importedTimetable}
            setImportedTimetable={setImportedTimetable}
          />
          <TimetableHeader semester={semester} readOnly={readOnly} />
        </>
      }
      readOnly={readOnly}
    />
  );
};

export default deferComponentRender(TimetableContainerComponent);
