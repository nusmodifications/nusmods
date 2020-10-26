import { captureException } from '@sentry/browser';
import { fetchModuleList } from 'actions/moduleBank';
import { JSResource } from 'utils/JSResource';
import { Resource, createResource } from 'utils/Resource';
import type { EntryPoint } from 'views/routes/types';

export type PreparedProps = {
  moduleList: Resource<void, string, unknown>;
  moduleListPromise: Promise<unknown>;
};

// HACK: Cache the promise so that we can feed a constant value to <AppShell> to
// fetch timetable modules after timetables have been fetched from localStorage.
// Typed as unknown because we don't actually need the output
let cachedModuleListPromise: Promise<unknown>;

let moduleListResource: Resource<void, string, unknown>;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'AppShell',
    () => import(/* webpackChunkName: "AppShell" */ 'views/AppShell'),
  ),
  getPreparedProps(_params, dispatch) {
    if (!moduleListResource) {
      moduleListResource = createResource<void, string, unknown>(
        () => {
          cachedModuleListPromise = (async () => {
            try {
              // TODO: Defer to an idle callback?
              return (dispatch(fetchModuleList()) as unknown) as Promise<unknown>;
            } catch (error) {
              captureException(error);
              throw error;
            }
          })();
          return cachedModuleListPromise;
        },
        () => 'moduleList',
      );
    }

    moduleListResource.preload();
    return {
      moduleList: moduleListResource,
      moduleListPromise: cachedModuleListPromise,
    };
  },
};

export default entryPoint;
