import { ComponentType, FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { match as Match, Redirect, useLocation, useRouteMatch } from 'react-router-dom';
import { get } from 'lodash';

import type { AxiosError } from 'axios';
import type { ModuleCode } from 'types/modules';
import type { Dispatch } from 'types/redux';
import type { State } from 'types/state';

import { fetchModule } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import retryImport from 'utils/retryImport';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { modulePage } from 'views/routes/paths';

import type { Props as ModulePageContentProps } from './ModulePageContent';

type Params = {
  moduleCode: string;
};

const getPropsFromMatch = (match: Match<Params>) => ({
  moduleCode: (match.params.moduleCode ?? '').toUpperCase(),
});

/**
 * Wrapper component that loads both module data and the module page component
 * simultaneously, and displays the correct component depending on the state.
 *
 * - Module data is considered to be loaded when the the data exists in
 *   the module bank
 * - Component is loaded when the dynamic import() Promise resolves
 *
 * We then render the correct component based on the status
 *
 * - Not found: moduleCode not in module list (this is checked synchronously)
 * - Error: Either requests failed
 * - Loading: Either requests are pending
 * - Loaded: Both requests are successfully loaded
 */
export const ModulePageContainerComponent: FC = () => {
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
  const { moduleCode } = getPropsFromMatch(match);

  // Fetch module on mount and when params are updated
  const fetchModuleForDisplay = useCallback(() => {
    setError(undefined);
    dispatch(fetchModule(moduleCode)).catch(handleFetchError);
  }, [dispatch, handleFetchError, moduleCode]);

  const previousModuleCode = useRef<ModuleCode>();
  useEffect(() => {
    if (previousModuleCode.current !== moduleCode) {
      previousModuleCode.current = moduleCode;
      fetchModuleForDisplay();
    }
  }, [fetchModuleForDisplay, moduleCode]);

  const location = useLocation();

  const module = useSelector(({ moduleBank }: State) => moduleBank.modules[moduleCode]);

  if (get(error, ['response', 'status'], 200) === 404) {
    return <ModuleNotFoundPage moduleCode={moduleCode} tryArchive />;
  }

  // If there is an error but module data can still be found, we assume module has
  // been loaded at some point, so we just show that instead
  if (error && !module) {
    return <ApiError dataName="course information" retry={fetchModuleForDisplay} />;
  }

  // Redirect to canonical URL
  if (module && match.url !== modulePage(moduleCode, module.title)) {
    const canonicalUrl = modulePage(moduleCode, module.title);
    return <Redirect to={{ ...location, pathname: canonicalUrl }} />;
  }

  if (module && ModulePageContent) {
    // Unique key forces component to remount whenever the user moves to
    // a new module. This allows the internal state (eg. currently selected
    // timetable semester) of <ModulePageContent> to be consistent
    return <ModulePageContent key={moduleCode} module={module} />;
  }

  return <LoadingSpinner />;
};

export default deferComponentRender(ModulePageContainerComponent);
