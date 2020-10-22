import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/types';

export type PreparedProps = unknown;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'ModuleFinder',
    () => import(/* webpackChunkName: "ModuleFinder.route" */ './ModuleFinderContainer'),
  ),
  prepare() {
    return {};
  },
};

export default entryPoint;
