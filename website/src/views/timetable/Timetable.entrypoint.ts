import { JSResource } from 'utils/JSResource';
import { EntryPoint } from 'views/routes/EntryPointContainer';

const entryPoint: EntryPoint<unknown> = {
  component: JSResource(
    'Timetable',
    () => import(/* webpackChunkName: "Timetable.route" */ 'views/timetable/TimetableContainer'),
  ),
  prepare() {
    return {};
  },
};

export default entryPoint;
