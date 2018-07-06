// @flow
import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import NUSModerator from 'nusmoderator';
import { groupBy, range } from 'lodash';

import type { ModuleWithColor, Semester } from 'types/modules';
import config from 'config';
import { formatExamDate, getModuleExamDate } from 'utils/modules';
import { daysAfter } from 'utils/timify';
import { modulePage } from 'views/routes/paths';
import { DaysOfWeek } from 'types/modules';

import styles from './ExamCalendar.scss';

type Props = {
  semester: Semester,
  modules: ModuleWithColor[],
};

type TimeSegment = 'Morning' | 'Afternoon' | 'Evening';
const TIME_SEGMENTS = ['Morning', 'Afternoon', 'Evening'];

type ModuleWithExamTime = {
  module: ModuleWithColor,
  dateTime: string,
  date: string,
  time: string,
  timeSegment: TimeSegment,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The API returns examDate with hhmm as the TZ specifier, but we want this to work
// on machines in all timezones, so instead we lop it off and pretend it is in UTC time
function examDateStringToDate(date: string): Date {
  return new Date(`${date.slice(0, 16)}Z`);
}

function getExamDate(date: Date): string {
  return formatExamDate(date.toISOString()).split(' ')[0];
}

// NUS exams are grouped into morning, afternoon and evening exams. Afternoon exams happen at 2.30PM
// on Fridays only. We don't want to create two different groups for 1pm and 2.30pm exams, so we
// create another mapping here
function getTimeSegment(time: string): TimeSegment {
  switch (time) {
    case '9:00 AM':
      return 'Morning';
    case '1:00 PM':
    case '2:30 PM':
    case '3:00 PM':
      return 'Afternoon';
    case '5:00 PM':
    case '6:30 PM':
      return 'Evening';
    default:
      throw new Error(`Unrecognized exam time: ${time}`);
  }
}

function ExamModule({ module }: { module: ModuleWithColor }) {
  return (
    <Link
      to={modulePage(module.ModuleCode, module.ModuleTitle)}
      className={`hoverable color-${module.colorIndex}`}
    >
      <div className={styles.moduleCode}>{module.ModuleCode}</div>
      <div className={styles.moduleTitle}>{module.ModuleTitle}</div>
    </Link>
  );
}

function ExamWeek({
  modules,
  weekNumber,
  firstDayOfExams,
  days,
}: {
  modules: { [string]: ModuleWithExamTime[] },
  weekNumber: number,
  firstDayOfExams: Date,
  days: number,
}) {
  // Array of dates to display
  const dayDates = range(days).map((offset) => daysAfter(firstDayOfExams, weekNumber * 7 + offset));

  // Each week consists of a header row and three module rows, one for each possible time segment
  const headerRow = (
    <tr>
      {dayDates.map((date, dayNumber) => {
        // Format the date number for each day of the exam. We avoid repeating
        // the month name unnecessarily by only showing it for the very first cell,
        // and when the month changes
        let examDateString = String(date.getUTCDate());
        if ((weekNumber === 0 && dayNumber === 0) || examDateString === '1') {
          examDateString = `${MONTHS[date.getUTCMonth()]} ${examDateString}`;
        }

        return (
          <th className={styles.dayDate} key={examDateString}>
            <time dateTime={date.toDateString()}>{examDateString}</time>
          </th>
        );
      })}
    </tr>
  );

  const moduleRows = TIME_SEGMENTS.map((timeSegment) => (
    <tr key={timeSegment}>
      {dayDates.map((date) => {
        // Get modules with exams on this day and time segment
        const modulesOnThisDay = modules[getExamDate(date)] || [];
        const modulesAtThisTime = modulesOnThisDay.filter(
          (module) => module.timeSegment === timeSegment,
        );

        return (
          <td className={styles.day} key={date}>
            {!!modulesAtThisTime.length && (
              <Fragment>
                <h4>{modulesAtThisTime[0].time}</h4>
                {modulesAtThisTime.map(({ module }) => (
                  <ExamModule key={module.ModuleCode} module={module} />
                ))}
              </Fragment>
            )}
          </td>
        );
      })}
    </tr>
  ));

  return (
    <Fragment>
      {headerRow}
      {moduleRows}
    </Fragment>
  );
}

export default class ExamCalendar extends PureComponent<Props> {
  getVisibleModules() {
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

      const date = examDateStringToDate(dateString);
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
      ...modulesWithExams.map((module) => examDateStringToDate(module.dateTime).getUTCDay()),
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
      <Fragment>
        <div className={styles.calendarWrapper}>
          <table>
            <thead>
              <tr>
                {range(daysWithExams).map((day) => (
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
                  days={daysWithExams}
                  weekNumber={week}
                  firstDayOfExams={firstDayOfExams}
                  modules={modulesByExamDate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Fragment>
    );
  }
}
