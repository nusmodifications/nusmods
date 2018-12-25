// @flow
import config from 'config';
import { getModuleSemesterData, getTimeslot } from 'utils/modules';
import ModuleFilter from 'utils/filters/ModuleFilter';
import type { Semester, Time, Day } from 'types/modules';

export type TimeslotType = 'Lecture' | 'Tutorial';
export const TimeslotTypes = ['Lecture', 'Tutorial'];

// Map TimeslotTypes to the property on SemesterData that contains the lecture or tutorial
// timeslot info
const timeslotProperties: { [TimeslotType]: string } = {
  Lecture: 'LecturePeriods',
  Tutorial: 'TutorialPeriods',
};

export default class TimeslotFilter extends ModuleFilter {
  semester: Semester;
  type: TimeslotType;
  day: Day;
  time: Time;

  constructor(day: Day, time: Time, type: TimeslotType, semester: Semester = config.semester) {
    const timeslotProperty = timeslotProperties[type];
    const timeslot = getTimeslot(day, time);
    const id = TimeslotFilter.labelToId(timeslot);

    super(id, timeslot, (module) => {
      const lesson = getModuleSemesterData(module, semester);
      if (!lesson) return false;
      const timeslots = lesson[timeslotProperty];
      return timeslots ? timeslots.includes(timeslot) : false;
    });

    this.day = day;
    this.time = time;
    this.type = type;
    this.semester = semester;
  }

  static labelToId(label: string): string {
    return label.toLowerCase().replace(' ', '-');
  }
}
