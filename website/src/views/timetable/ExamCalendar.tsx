import { PureComponent } from 'react';
import { groupBy, range } from 'lodash-es';
import classnames from 'classnames';
import { addDays } from 'date-fns';

import { Semester, DaysOfWeek } from 'types/modules';
import { ModuleWithColor, ModuleWithExamTime, TimeSegment } from 'types/views';
import { formatExamDate, getExamDate } from 'utils/modules';
import { toSingaporeTime } from 'utils/timify';
import elements from 'views/elements';
import ExamWeek from './ExamWeek';
import styles from './ExamCalendar.scss';

type Props = {
  readonly semester: Semester;
  readonly modules: ModuleWithColor[];
};

// NUS exams are grouped into morning, afternoon and evening exams. Afternoon exams happen at 2.30PM
// on Fridays only. We don't want to create two different groups for 1pm and 2.30pm exams, so we
// create another mapping here
export function getTimeSegment(time: string): TimeSegment {
  if (time.toUpperCase().includes('AM')) {
    return 'Morning';
  }

  const hour = parseInt(time, 10);
  return hour === 12 || hour < 5 ? 'Afternoon' : 'Evening';
}

export default class ExamCalendar extends PureComponent<Props> {
  getVisibleModules(): ModuleWithColor[] {
    return this.props.modules.filter(
      (module) => !module.isHiddenInTimetable && !module.isTaInTimetable,
    );
  }

  // Utility function to get the first day of exams and calculate the number of weeks
  getExamCalendar(): [Date, number] {
    const { semester } = this.props;

    const examDates = this.getVisibleModules()
      .map((module) => getExamDate(module, semester))
      .filter(Boolean as unknown as (dateString: string | null) => dateString is string)
      .map((dateString) => toSingaporeTime(dateString));

    if (examDates.length === 0) {
      return [new Date(), 0];
    }

    const firstExamDate = examDates.reduce((a, b) => (a < b ? a : b));
    const lastExamDate = examDates.reduce((a, b) => (a > b ? a : b));

    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
    const firstDayOfExams = addDays(firstExamDate, -firstExamDate.getDay() + 1);
    const lastMondayOfExams = addDays(lastExamDate, -lastExamDate.getDay() + 1);
    const weekCount =
      Math.round((lastMondayOfExams.getTime() - firstDayOfExams.getTime()) / MS_PER_WEEK) + 1;

    return [firstDayOfExams, weekCount];
  }

  modulesWithExamDate() {
    const { semester } = this.props;

    // Wrap each module with its exam date info. This means we don't have to recalculate these
    // every time we need them
    const modulesWithExams: ModuleWithExamTime[] = [];
    this.getVisibleModules().forEach((module) => {
      const dateTime = getExamDate(module, semester);
      if (!dateTime) return;

      const [date, ...timeParts] = formatExamDate(dateTime).split(' ');
      const time = timeParts.join(' ');

      modulesWithExams.push({
        module,
        dateTime,
        date,
        time,
        timeSegment: getTimeSegment(time),
      });
    });

    return modulesWithExams;
  }

  override render() {
    const [firstDayOfExams, weekCount] = this.getExamCalendar();

    if (!weekCount) {
      return (
        <p className={styles.noExams}>
          You don&apos;t have any final exams this semester{' '}
          <span className="h3" role="img" aria-label="Tada!">
            🎉
          </span>
        </p>
      );
    }

    const modulesWithExams = this.modulesWithExamDate();

    const minDisplayDays = 5;
    const maxDisplayDays = 7;

    const daysToDisplay = modulesWithExams
      .map((module) => toSingaporeTime(module.dateTime).getDay())
      .some((day) => day === 6)
      ? maxDisplayDays
      : minDisplayDays;

    const modulesByExamDate = groupBy(modulesWithExams, (module) => module.date);

    // The table consists of the following <tr>s
    // - Day of the week (Mon - Sat)
    // - For each week:
    //   - Exam date (1 - 31)
    //   - Morning exams
    //   - Afternoon exams
    //   - Evening exams
    return (
      <div className={classnames(styles.calendarWrapper, elements.examCalendar)}>
        <table>
          <thead>
            <tr>
              {range(daysToDisplay).map((day) => (
                <th key={day} className={styles.dayName}>
                  {DaysOfWeek[day].slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {range(weekCount).map((week) => (
              <ExamWeek
                key={week}
                days={daysToDisplay}
                weekNumber={week}
                firstDayOfExams={firstDayOfExams}
                modules={modulesByExamDate}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
