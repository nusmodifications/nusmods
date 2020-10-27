import React, { Suspense, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { get } from 'lodash';

import type { State } from 'types/state';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPointComponentProps } from 'views/routes/types';
import type { Resource } from 'utils/Resource';

import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { moduleArchive } from 'views/routes/paths';
import ErrorBoundary from 'views/errors/ErrorBoundary';

import ModulePageContent from './ModulePageContent';

type PreparedProps = {
  moduleResource: Resource<{ moduleCode: ModuleCode; archiveYear: string }, string, Module>;
  moduleCode: ModuleCode;
  archiveYear: string;
};

type Props = EntryPointComponentProps<PreparedProps>;

// TODO: Generalize this smart error fallback for other error boundaries
const ErrorFallback: React.FC<{
  error: Error;
  moduleCode: string;
}> = ({ error, moduleCode }) => {
  if (get(error, ['response', 'status'], 200) === 404) {
    return <ModuleNotFoundPage moduleCode={moduleCode} tryArchive={false} />;
  }

  // TODO: Handle other errors; we can't just assume everything's a load error
  return <ApiError dataName="module information" />;
};

/**
 * Wrapper component for the archive page that handles data fetching and error handling.
 * This is very similar to ModulePageContainer except it is used for the archive
 * page, so it uses different code paths for canonical URL and error handling -
 * the normal page tries to check the archives if this year's API returns 404,
 * while this page doesn't.
 */
export const ModuleArchiveContainerComponent: React.FC<Props> = ({
  prepared: { moduleResource, moduleCode, archiveYear },
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // If module already exists within our Redux store, use it instead of the
  // preloaded resource (which writes to the Redux store anyway).
  const module = useSelector((state: State) =>
    get(state.moduleBank.moduleArchive, [moduleCode, archiveYear], undefined),
  );

  useEffect(() => {
    // Navigate to canonical URL
    const canonicalUrl = moduleArchive(moduleCode, archiveYear, module?.title);
    if (module && location.pathname !== canonicalUrl) {
      navigate({ ...location, pathname: canonicalUrl }, { replace: true });
    }
  }, [archiveYear, location, module, moduleCode, navigate]);

  return (
    <ErrorBoundary
      key={`${archiveYear}-${moduleCode}`}
      errorPage={(error) => <ErrorFallback error={error} moduleCode={moduleCode} />}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <ModulePageContent
          module={module}
          moduleResource={moduleResource}
          moduleCode={moduleCode}
          archiveYear={archiveYear}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ModuleArchiveContainerComponent;
