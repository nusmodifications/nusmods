import type { Params } from 'react-router';
import { fetchModule } from 'actions/moduleBank';
import { Module } from 'types/modules';
import { captureException } from 'utils/error';
import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/types';

export type PreparedProps = {
  module: JSResource<Module>;
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
    module.preloadOrReloadIfError();
    return {
      module,
    };
  },
};

export default entryPoint;
