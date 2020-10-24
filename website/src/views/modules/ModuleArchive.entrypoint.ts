import type { Params } from 'react-router';
import { fetchModuleArchive } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import { JSResource } from 'utils/JSResource';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPoint } from 'views/routes/types';

export type PreparedProps = {
  module: JSResource<Module>;
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
    'ModuleArchive',
    () => import(/* webpackChunkName: "ModuleArchive.route" */ './ModuleArchiveContainer'),
  ),
  prepare(params, dispatch) {
    const { moduleCode, archiveYear } = getPropsFromParams(params);
    const module = JSResource(`ModuleArchiveContainer-module-${moduleCode}-${archiveYear}`, () =>
      dispatch<Module>(fetchModuleArchive(moduleCode, archiveYear)).catch((error) => {
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
      moduleCode,
      archiveYear,
    };
  },
};

export default entryPoint;
