// @flow
import React, { PureComponent } from 'react';
import NUSModerator from 'nusmoderator';
import { groupBy, range } from 'lodash';
import classnames from 'classnames';

import type { ModuleWithColor, Semester } from 'types/modules';
import type { ModuleWithExamTime, TimeSegment } from 'types/views';
import { WorkingDaysOfWeek } from 'types/modules';
import config from 'config';
import { examDateToDate, formatExamDate, getModuleExamDate } from 'utils/modules';
import { daysAfter } from 'utils/timify';
import elements from 'views/elements';
import ExamWeek from './ExamWeek';
import styles from './ExamCalendar.scss';

type Props = {|
  +semester: Semester,
  +modules: ModuleWithColor[],
|};

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
    return this.props.modules.filter((module) => !module.hiddenInTimetable);
  }

  // Utility function to get the first day of exams and calculate the number of weeks
  getExamCalendar(): [Date, number] {
    const { semester } = this.props;
    const year = `${config.academicYear.slice(2, 4)}/${config.academicYear.slice(-2)}`;
    let firstDayOfExams = NUSModerator.academicCalendar.getExamWeek(year, semester);
    firstDayOfExams = new Date(firstDayOfExams - firstDayOfExams.getTimezoneOffset() * 60 * 1000);

    let weekCount = 0;
    let lastDayOfExams = daysAfter(firstDayOfExams, 0);

    // Check modules for outliers, eg. GER1000 that has exams on the Saturday before the exam week
    // and expand the range accordingly
    this.getVisibleModules().forEach((module) => {
      const dateString = getModuleExamDate(module, semester);
      if (!dateString) return;

      const date = examDateToDate(dateString);
      while (date < firstDayOfExams) {
        firstDayOfExams = daysAfter(firstDayOfExams, -7);
        weekCount += 1;
      }

      while (date > lastDayOfExams) {
        lastDayOfExams = daysAfter(lastDayOfExams, 7);
        weekCount += 1;
      }
    });

    return [firstDayOfExams, weekCount];
  }

  modulesWithExamDate() {
    const { semester } = this.props;

    // Wrap each module with its exam date info. This means we don't have to recalculate these
    // every time we need them
    const modulesWithExams: ModuleWithExamTime[] = [];
    this.getVisibleModules().forEach((module) => {
      const dateTime = getModuleExamDate(module, semester);
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

  render() {
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

    // Get the number of days of the week which have exams on them. Default to Monday to Friday
    // (5 days), and expand as necessary
    const daysWithExams = Math.max(
      5,
      ...modulesWithExams.map((module) => examDateToDate(module.dateTime).getUTCDay()),
    );

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
              {range(daysWithExams).map((day) => (
                <th key={day} className={styles.dayName}>
                  {WorkingDaysOfWeek[day].slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {range(weekCount).map((week) => (
              <ExamWeek
                key={week}
                days={daysWithExams}
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
