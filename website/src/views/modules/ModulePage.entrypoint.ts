import type { Params } from 'react-router';
import { fetchModule } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import { Resource, createResource } from 'utils/Resource';
import { JSResource } from 'utils/JSResource';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPoint } from 'views/routes/types';

export type PreparedProps = {
  module: Resource<void, string, Module>;
  moduleCode: ModuleCode;
};

const getPropsFromParams = (params: Params) => ({
  moduleCode: (params.moduleCode ?? '').toUpperCase(),
});

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModulePageContainer',
    () => import(/* webpackChunkName: "ModulePageContainer" */ './ModulePageContainer'),
  ),
  prepare(params, dispatch) {
    const { moduleCode } = getPropsFromParams(params);
    const module = createResource<void, string, Module>(
      () =>
        dispatch(fetchModule(moduleCode)).catch((error) => {
          captureException(error);
          // TODO: If there is an error but module data can still be found, we
          // can assume module has been loaded at some point, so we can just show
          // that instead
          throw error;
        }),
      () => `ModulePageContainer-module-${moduleCode}`,
    );
    // TODO: Temp failures will prevent the module from ever being loaded, until
    // a reload.
    module.preload();
    return {
      module,
      moduleCode,
    };
  },
};

export default entryPoint;
