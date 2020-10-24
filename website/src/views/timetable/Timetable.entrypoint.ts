import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/types';

const entryPoint: EntryPoint<unknown> = {
  component: JSResource(
    'TimetableContainer',
    () => import(/* webpackChunkName: "TimetableContainer" */ 'views/timetable/TimetableContainer'),
  ),
  prepare() {
    return {};
  },
};

export default entryPoint;
