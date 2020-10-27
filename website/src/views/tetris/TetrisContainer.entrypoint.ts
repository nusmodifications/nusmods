import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/types';

export type PreparedProps = unknown;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'TetrisContainer',
    () => import(/* webpackChunkName: "TetrisContainer" */ './TetrisContainer'),
  ),
  getPreparedProps() {
    return {};
  },
};

export default entryPoint;
