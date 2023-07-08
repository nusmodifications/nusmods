import { ComponentType, FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { match as Match, Redirect, useLocation, useRouteMatch } from 'react-router-dom';
import { get } from 'lodash';

import type { AxiosError } from 'axios';
import type { ModuleCode } from 'types/modules';
import type { Dispatch } from 'types/redux';
import type { State } from 'types/state';

import { fetchModuleArchive } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import retryImport from 'utils/retryImport';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { moduleArchive } from 'views/routes/paths';

import type { Props as ModulePageContentProps } from './ModulePageContent';

type Params = {
  year: string;
  moduleCode: string;
};

function getPropsFromMatch(match: Match<Params>) {
  const { year = '', moduleCode = '' } = match.params;
  return {
    moduleCode: moduleCode.toUpperCase(),
    year: year.replace('-', '/'),
  };
}

/**
 * Wrapper component for the archive page that handles data fetching and error handling.
 * This is very similar to ModulePageContainer except it is used for the archive
 * page, so it uses different code paths for canonical URL, data fetching and
 * error handling - the normal page tries to check the archives if this year's
 * API returns 404, while this page doesn't.
 */
export const ModuleArchiveContainerComponent: FC = () => {
  const [ModulePageContent, setModulePageContent] =
    useState<ComponentType<ModulePageContentProps> | null>(null);
  const [error, setError] = useState<Error | undefined>();

  const dispatch = useDispatch<Dispatch>();

  const handleFetchError = useCallback((fetchError: AxiosError) => {
    setError(fetchError);
    captureException(fetchError);
  }, []);

  useEffect(
    () => {
      // Try importing ModulePageContent thrice if we're online and
      // getting the "Loading chunk x failed." error.
      retryImport(() => import(/* webpackChunkName: "module" */ 'views/modules/ModulePageContent'))
        .then((module) => setModulePageContent(() => module.default))
        .catch(handleFetchError);
    },
    // Only load dynamic import on first mount.
    // Assume `handleFetchError` will never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const match = useRouteMatch<Params>();
  const { moduleCode, year } = getPropsFromMatch(match);

  // Fetch module on mount and when params are updated
  const fetchModuleForDisplay = useCallback(() => {
    setError(undefined);
    dispatch(fetchModuleArchive(moduleCode, year)).catch(handleFetchError);
  }, [dispatch, handleFetchError, moduleCode, year]);

  const previousModuleCode = useRef<ModuleCode>();
  const previousArchiveYear = useRef<string>();
  useEffect(() => {
    if (previousModuleCode.current !== moduleCode || previousArchiveYear.current !== year) {
      previousModuleCode.current = moduleCode;
      previousArchiveYear.current = year;
      fetchModuleForDisplay();
    }
  }, [fetchModuleForDisplay, moduleCode, year]);

  const location = useLocation();

  const module = useSelector(({ moduleBank }: State) =>
    get(moduleBank.moduleArchive, [moduleCode, year], null),
  );

  if (get(error, ['response', 'status'], 200) === 404) {
    return <ModuleNotFoundPage moduleCode={moduleCode} tryArchive={false} />;
  }

  // If there is an error but module data can still be found, we assume module has
  // been loaded at some point, so we just show that instead
  if (error && !module) {
    return <ApiError dataName="course information" retry={fetchModuleForDisplay} />;
  }

  // Redirect to canonical URL
  if (module) {
    const canonicalUrl = moduleArchive(moduleCode, year, module.title);
    if (match.url !== canonicalUrl) {
      return <Redirect to={{ ...location, pathname: canonicalUrl }} />;
    }
  }

  if (module && ModulePageContent) {
    // Unique key forces component to remount whenever the user moves to
    // a new module. This allows the internal state (eg. currently selected
    // timetable semester) of <ModulePageContent> to be consistent
    return <ModulePageContent key={`${year}-${moduleCode}`} archiveYear={year} module={module} />;
  }

  return <LoadingSpinner />;
};

export default deferComponentRender(ModuleArchiveContainerComponent);
