import React, { Suspense, useEffect } from 'react';
import type { Params } from 'react-router';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { get } from 'lodash';

import type { Module } from 'types/modules';
import type { EntryPointComponentProps } from 'views/routes/types';
import type { JSResource } from 'utils/JSResource';

import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { modulePage } from 'views/routes/paths';
import ErrorBoundary from 'views/errors/ErrorBoundary';

import ModulePageContent from './ModulePageContent';

type PreparedProps = {
  module: JSResource<Module>;
};

type Props = EntryPointComponentProps<PreparedProps>;

const getPropsFromParams = (params: Params) => ({
  moduleCode: (params.moduleCode ?? '').toUpperCase(),
});

// TODO: Generalize this smart error fallback for other error boundaries
const ErrorFallback: React.FC<{ error: Error; moduleCode: string }> = ({ error, moduleCode }) => {
  if (get(error, ['response', 'status'], 200) === 404) {
    return <ModuleNotFoundPage moduleCode={moduleCode} tryArchive />;
  }

  // TODO: Handle other errors; we can't just assume everything's a load error
  return <ApiError dataName="module information" />;
};

/**
 * TODO: Update docstring
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
export const ModulePageContainerComponent: React.FC<Props> = ({ prepared: { module } }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useParams();
  const { moduleCode } = getPropsFromParams(params);

  useEffect(() => {
    // Navigate to canonical URL
    if (module.get() && location.pathname !== modulePage(moduleCode, module.get()?.title)) {
      navigate(
        { ...location, pathname: modulePage(moduleCode, module.get()?.title) },
        { replace: true },
      );
    }
  }, [location, module, moduleCode, navigate]);

  // Unique key forces component to remount whenever the user moves to
  // a new module. This allows the internal state (eg. currently selected
  // timetable semester) of <ModulePageContent> to be consistent
  return (
    <ErrorBoundary
      key={moduleCode}
      errorPage={(error) => <ErrorFallback error={error} moduleCode={moduleCode} />}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <ModulePageContent module={module} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ModulePageContainerComponent;
