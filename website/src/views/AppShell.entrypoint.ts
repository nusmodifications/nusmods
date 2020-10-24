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

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'AppShell',
    () => import(/* webpackChunkName: "AppShell" */ 'views/AppShell'),
  ),
  prepare(_params, dispatch) {
    const moduleList = createResource<void, string, unknown>(
      () => {
        if (!cachedModuleListPromise) {
          // TODO: Defer to an idle callback?
          cachedModuleListPromise = (async () => {
            try {
              return (dispatch(fetchModuleList()) as unknown) as Promise<unknown>;
            } catch (error) {
              captureException(error);
              throw error;
            }
          })();
        }
        return cachedModuleListPromise;
      },
      () => 'moduleList',
    );
    moduleList.preload();
    return {
      moduleList,
      moduleListPromise: cachedModuleListPromise,
    };
  },
};

export default entryPoint;
