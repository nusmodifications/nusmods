import type { Params } from 'react-router';
import { fetchModuleArchive } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import { Resource, createResource } from 'utils/Resource';
import { JSResource } from 'utils/JSResource';
import type { Module, ModuleCode } from 'types/modules';
import type { EntryPoint } from 'views/routes/types';

type ModuleArchiveResource = Resource<
  { moduleCode: ModuleCode; archiveYear: string },
  string,
  Module
>;

export type PreparedProps = {
  moduleResource: ModuleArchiveResource;
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

let moduleResource: ModuleArchiveResource;

/**
 * This is very similar to ModulePage.entrypoint except it is used for the
 * archive page, so it uses different code paths for data fetching.
 */
const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModuleArchiveContainer',
    () => import(/* webpackChunkName: "ModuleArchiveContainer" */ './ModuleArchiveContainer'),
  ),
  getPreparedProps(params, dispatch) {
    if (!moduleResource) {
      moduleResource = createResource(
        ({ moduleCode, archiveYear }) =>
          dispatch<Module>(fetchModuleArchive(moduleCode, archiveYear)).catch((error) => {
            captureException(error);
            // TODO: If there is an error but module data can still be found, we
            // can assume module has been loaded at some point, so we can just show
            // that instead
            throw error;
          }),
        ({ moduleCode, archiveYear }) =>
          `ModuleArchiveContainer-module-${moduleCode}-${archiveYear}`,
      );
    }

    const { moduleCode, archiveYear } = getPropsFromParams(params);
    moduleResource.preload({ moduleCode, archiveYear });
    return {
      moduleResource,
      moduleCode,
      archiveYear,
    };
  },
  disposePreparedProps(params) {
    const { moduleCode, archiveYear } = getPropsFromParams(params);
    moduleResource.invalidate({ moduleCode, archiveYear });
  },
};

export default entryPoint;
