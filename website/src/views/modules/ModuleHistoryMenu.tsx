import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ChevronUp } from 'react-feather';
import classnames from 'classnames';

import type { ModuleCode, ModuleTitle } from 'types/modules';
import type { Dispatch } from 'types/redux';
import type { State } from 'types/state';

import config from 'config';
import { fetchAllModuleArchive, fetchModule } from 'actions/moduleBank';
import { fetchModuleRequest } from 'actions/constants';
import { isFailure, isOngoing, isSuccess } from 'selectors/requests';
import { availableArchive, isArchiveLoading } from 'selectors/timetables';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { moduleArchive, modulePage } from 'views/routes/paths';

import styles from './ModuleHistoryMenu.scss';

type Props = {
  moduleCode: ModuleCode;
  moduleTitle: ModuleTitle;
  archiveYear?: string;
};

function sortArchiveYears(years: string[]): string[] {
  return [...years].sort((first, second) => second.localeCompare(first));
}

const ModuleHistoryMenu: React.FC<Props> = ({ moduleCode, moduleTitle, archiveYear }) => {
  const dispatch = useDispatch<Dispatch>();
  const archiveYears = useSelector((state: State) =>
    sortArchiveYears(availableArchive(state, moduleCode)),
  );
  const currentModuleRequest = fetchModuleRequest(moduleCode);
  const isCurrentCourseLoading = useSelector((state: State) =>
    isOngoing(state, currentModuleRequest),
  );
  const hasCurrentCourseRequestFinished = useSelector(
    (state: State) =>
      isSuccess(state, currentModuleRequest) || isFailure(state, currentModuleRequest),
  );
  const hasCurrentCourse = useSelector(
    (state: State) =>
      isSuccess(state, currentModuleRequest) && Boolean(state.moduleBank.modules[moduleCode]),
  );
  const isArchiveDataLoading = useSelector((state: State) => isArchiveLoading(state, moduleCode));
  const isLoading = isArchiveDataLoading || (Boolean(archiveYear) && isCurrentCourseLoading);

  const hasRequestedArchives = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const yearsId = useId();
  const hasHistory = archiveYears.length > 0 || (Boolean(archiveYear) && hasCurrentCourse);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  const requestArchives = useCallback(() => {
    if (hasRequestedArchives.current) return;

    hasRequestedArchives.current = true;
    void dispatch(fetchAllModuleArchive(moduleCode));
  }, [dispatch, moduleCode]);

  useEffect(() => {
    if (hasRequestedArchives.current || archiveYears.length === config.archiveYears.length) {
      return;
    }

    requestArchives();
  }, [archiveYears.length, requestArchives]);

  useEffect(() => {
    if (!archiveYear || isCurrentCourseLoading || hasCurrentCourseRequestFinished) return;

    void dispatch(fetchModule(moduleCode)).catch(() => undefined);
  }, [archiveYear, dispatch, hasCurrentCourseRequestFinished, isCurrentCourseLoading, moduleCode]);

  return (
    <div className={styles.container} aria-live="polite">
      <strong className={styles.label}>Course History</strong>

      {isLoading && (
        <div className={styles.status} role="status">
          <LoadingSpinner small /> Loading historical data...
        </div>
      )}

      {!isLoading && hasHistory && (
        <>
          <button
            type="button"
            className={classnames('btn btn-link', styles.link)}
            aria-expanded={expanded}
            aria-controls={yearsId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Hide past courses' : 'Show past courses'}
            <Chevron className={classnames('svg-small', styles.chevron)} aria-hidden="true" />
          </button>

          <ul
            id={yearsId}
            className={styles.links}
            aria-label="Course History years"
            hidden={!expanded}
          >
            {archiveYear && hasCurrentCourse && (
              <li>
                <Link className={styles.link} to={modulePage(moduleCode, moduleTitle)}>
                  Current course (AY{config.academicYear})
                </Link>
              </li>
            )}

            {archiveYears.map((year) => (
              <li key={year}>
                <Link
                  className={styles.link}
                  to={moduleArchive(moduleCode, year, moduleTitle)}
                  aria-current={archiveYear === year ? 'page' : undefined}
                >
                  AY{year}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {!isLoading && hasRequestedArchives.current && !archiveYears.length && (
        <div className={styles.status} role="status">
          No historical data available
        </div>
      )}
    </div>
  );
};

export default ModuleHistoryMenu;
