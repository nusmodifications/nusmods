import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/types';

const entryPoint: EntryPoint<unknown> = {
  component: JSResource(
    'TimetableContainer',
    () => import(/* webpackChunkName: "TimetableContainer" */ 'views/timetable/TimetableContainer'),
  ),
  getPreparedProps() {
    return {};
  },
};

export default entryPoint;
