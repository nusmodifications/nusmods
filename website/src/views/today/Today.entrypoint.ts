import { JSResource } from 'utils/JSResource';
import venueLocationResource from 'views/components/map/venueLocationResource';
import { EntryPoint } from 'views/routes/types';

export type PreparedProps = unknown;

const entryPoint: EntryPoint<PreparedProps> = {
  component: JSResource(
    'TodayContainer',
    () => import(/* webpackChunkName: "TodayContainer" */ './TodayContainer'),
  ),
  getPreparedProps() {
    // Preload EventMap/EventMapInline data requirements
    venueLocationResource.preload();
    return {};
  },
};

export default entryPoint;
