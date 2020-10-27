import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/types';

export type PreparedProps = unknown;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModuleFinderContainer',
    () => import(/* webpackChunkName: "ModuleFinderContainer" */ './ModuleFinderContainer'),
  ),
  getPreparedProps() {
    return {};
  },
};

export default entryPoint;
