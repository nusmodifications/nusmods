import type { Params } from 'react-router';
import { fetchModule } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import { Resource, createResource } from 'utils/Resource';
import { JSResource } from 'utils/JSResource';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPoint } from 'views/routes/types';

type ModuleResource = Resource<{ moduleCode: ModuleCode }, string, Module>;

export type PreparedProps = {
  moduleResource: ModuleResource;
  moduleCode: ModuleCode;
};

const getPropsFromParams = (params: Params) => ({
  moduleCode: (params.moduleCode ?? '').toUpperCase(),
});

let moduleResource: ModuleResource;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModulePageContainer',
    () => import(/* webpackChunkName: "ModulePageContainer" */ './ModulePageContainer'),
  ),
  getPreparedProps(params, dispatch) {
    if (!moduleResource) {
      moduleResource = createResource(
        ({ moduleCode }) =>
          dispatch(fetchModule(moduleCode)).catch((error) => {
            captureException(error);
            // TODO: If there is an error but module data can still be found, we
            // can assume module has been loaded at some point, so we can just show
            // that instead
            throw error;
          }),
        ({ moduleCode }) => `ModulePageContainer-module-${moduleCode}`,
      );
    }

    const { moduleCode } = getPropsFromParams(params);
    moduleResource.preload({ moduleCode });
    return {
      moduleResource,
      moduleCode,
    };
  },
  disposePreparedProps(params) {
    const { moduleCode } = getPropsFromParams(params);
    moduleResource.invalidate({ moduleCode });
  },
};

export default entryPoint;
