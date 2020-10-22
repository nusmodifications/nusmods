import { captureException } from '@sentry/browser';
import { fetchModuleList } from 'actions/moduleBank';
import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/EntryPointContainer';

export type PreparedProps = {
  moduleList: JSResource<unknown>;
};

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'AppShell',
    () => import(/* webpackChunkName: "AppShell.route" */ 'views/AppShell'),
  ),
  prepare(_params, dispatch) {
    const moduleList = JSResource('moduleList', async () => {
      try {
        // Typed as unknown because we don't actually need the output
        return (dispatch(fetchModuleList()) as unknown) as Promise<unknown>;
      } catch (error) {
        captureException(error);
        throw error;
      }
    });
    moduleList.preload();
    return {
      moduleList,
    };
  },
};

export default entryPoint;
