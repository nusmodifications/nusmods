import type { Params } from 'react-router';
import { fetchModule } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import { JSResource } from 'utils/JSResource';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPoint } from 'views/routes/types';

export type PreparedProps = {
  module: JSResource<Module>;
  moduleCode: ModuleCode;
};

const getPropsFromParams = (params: Params) => ({
  moduleCode: (params.moduleCode ?? '').toUpperCase(),
});

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModulePage',
    () => import(/* webpackChunkName: "ModulePage.route" */ './ModulePageContainer'),
  ),
  prepare(params, dispatch) {
    const { moduleCode } = getPropsFromParams(params);
    const module = JSResource(`ModulePageContainer-module-${moduleCode}`, () =>
      dispatch(fetchModule(moduleCode)).catch((error) => {
        captureException(error);
        // TODO: If there is an error but module data can still be found, we
        // can assume module has been loaded at some point, so we can just show
        // that instead
        throw error;
      }),
    );
    // TODO: If the resource doesn't exist, we're looking at spraying many
    // requests for the same 404 resource because `prepare` may be called
    // multiple times on a single navigation.
    module.preloadOrReloadIfError();
    return {
      module,
      moduleCode,
    };
  },
};

export default entryPoint;
