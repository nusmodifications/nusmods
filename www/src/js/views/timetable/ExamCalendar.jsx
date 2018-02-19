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

type ExamDay = {
  date: Date,
  groupedModules: {
    [TimeSegment]: ModuleWithExamTime[],
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The API returns examDate with hhmm as the TZ specifier, but we want this to work
// on machines in all timezones, so instead we lop it off and pretend it is in UTC time
function examDateStringToDate(date: string): Date {
  return new Date(`${date.slice(0, 16)}Z`);
}

function getExamDate(date: ?string): ?string {
  if (!date) return null;
  return formatExamDate(date).split(' ')[0];
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
      return 'Afternoon';
    case '5:00 PM':
      return 'Evening';
    default:
      throw new Error(`Unrecognized exam time: ${time}`);
  }
}

function renderModule(module: ModuleWithColor) {
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

function ExamWeek({ week, weekNumber }: { week: ExamDay[], weekNumber: number }) {
  // Each week consists of a header row and three module rows, one for each
  // possible time segment
  const headerRow = (
    <tr>
      {week.map(({ date }, dayNumber) => {
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
      {week.map(({ groupedModules }, dayNumber) => {
        const modules = groupedModules[timeSegment];

        return (
          <td className={styles.day} key={dayNumber}>
            {modules && (
              <Fragment>
                <h4>{modules[0].time}</h4>
                {modules.map(({ module }) => (
                  <div key={module.ModuleCode}>{renderModule(module)}</div>
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
  // Utility function to get the first day of exams and calculate the number of weeks
  getExamCalendar(): [Date, number] {
    const { semester, modules } = this.props;
    const year = `${config.academicYear.slice(2, 4)}/${config.academicYear.slice(-2)}`;
    let firstDayOfExams = NUSModerator.academicCalendar.getExamWeek(year, semester);
    firstDayOfExams = new Date(firstDayOfExams - firstDayOfExams.getTimezoneOffset() * 60 * 1000);

    let weekCount = 0;
    let lastDayOfExams = daysAfter(firstDayOfExams, 0);

    // Check modules for outliers, eg. GER1000 that has exams on the Saturday before the exam week
    // and expand the range accordingly
    modules.forEach((module) => {
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

  groupModulesByExams() {
    const { semester } = this.props;
    const [firstDayOfExams, weekCount] = this.getExamCalendar();

    // If there are no modules with exams, then we can just stop here
    if (weekCount === 0) return null;

    // Wrap each module with its exam date info. This means we don't have to recalculate these
    // every time we need them
    const modulesWithExams: ModuleWithExamTime[] = [];
    this.props.modules.forEach((module) => {
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

    // Get the number of days of the week which have exams on them. Default to Monday to Friday
    // (5 days), and expand as necessary
    const daysWithExams = Math.max(
      5,
      ...modulesWithExams.map((module) => examDateStringToDate(module.dateTime).getUTCDay()),
    );

    // Group modules by their exam date and time
    const modulesByExamDate = groupBy(modulesWithExams, (module) => module.date);
    return range(weekCount).map((week) =>
      // Group by days
      range(daysWithExams).map((day) => {
        const date = daysAfter(firstDayOfExams, week * 7 + day);
        const modules = modulesByExamDate[getExamDate(date.toISOString())] || [];

        // Group by time segment
        return {
          date,
          groupedModules: groupBy(modules, (module: ModuleWithExamTime) => module.timeSegment),
        };
      }),
    );
  }

  render() {
    const modulesByExamDate = this.groupModulesByExams();

    if (!modulesByExamDate) {
      return (
        <p className="text-center">
          You don&apos;t have any final exams this semester{' '}
          <span className="h4" role="img" aria-label="Tada!">
            🎉
          </span>
        </p>
      );
    }

    // The table consists of the following <tr>s
    // - Day of the week (Mon - Sat)
    // - Exam date (1 - 31)
    // - Morning exams
    // - Afternoon exams
    // - Evening exams
    // - Repeat the above four rows for every week
    return (
      <Fragment>
        <div className="scrollable">
          <table className={styles.table}>
            <thead>
              <tr>
                {modulesByExamDate[0].map((_, day) => (
                  <th key={day} className={styles.dayName}>
                    {DaysOfWeek[day].slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulesByExamDate.map((week, index) => (
                <ExamWeek key={index} week={week} weekNumber={index} />
              ))}
            </tbody>
          </table>
        </div>
      </Fragment>
    );
  }
}
