import type { Params } from 'react-router';
import { fetchModuleArchive } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import { Resource, createResource } from 'utils/Resource';
import { JSResource } from 'utils/JSResource';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPoint } from 'views/routes/types';

export type PreparedProps = {
  module: Resource<void, string, Module>;
  moduleCode: ModuleCode;
  archiveYear: string;
};

const getPropsFromParams = (params: Params) => {
  const { archiveYear = '', moduleCode = '' } = params;
  return {
    moduleCode: moduleCode.toUpperCase(),
    archiveYear: archiveYear.replace('-', '/'),
  };
};

/**
 * This is very similar to ModulePage.entrypoint except it is used for the
 * archive page, so it uses different code paths for data fetching.
 */
const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModuleArchiveContainer',
    () => import(/* webpackChunkName: "ModuleArchiveContainer" */ './ModuleArchiveContainer'),
  ),
  prepare(params, dispatch) {
    const { moduleCode, archiveYear } = getPropsFromParams(params);
    const module = createResource<void, string, Module>(
      () =>
        dispatch<Module>(fetchModuleArchive(moduleCode, archiveYear)).catch((error) => {
          captureException(error);
          // TODO: If there is an error but module data can still be found, we
          // can assume module has been loaded at some point, so we can just show
          // that instead
          throw error;
        }),
      () => `ModuleArchiveContainer-module-${moduleCode}-${archiveYear}`,
    );
    module.preload();
    return {
      module,
      moduleCode,
      archiveYear,
    };
  },
};

export default entryPoint;
