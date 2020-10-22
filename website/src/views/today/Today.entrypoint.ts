import { JSResource } from 'utils/JSResource';
import venueLocationResource from 'views/components/map/venueLocationResource';
import { EntryPoint } from 'views/routes/EntryPointContainer';

export type PreparedProps = unknown;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'Today',
    () => import(/* webpackChunkName: "Today.route" */ './TodayContainer'),
  ),
  prepare() {
    venueLocationResource.preloadOrReloadIfError();
  },
};

export default entryPoint;
