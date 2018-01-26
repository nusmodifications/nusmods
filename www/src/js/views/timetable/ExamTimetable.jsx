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

import styles from './ExamTimetable.scss';

type Props = {
  semester: Semester,
  modules: ModuleWithColor[],
};

type TimeSegment = 'Morning' | 'Afternoon' | 'Evening';
const TIME_SEGMENTS = ['Morning', 'Afternoon', 'Evening'];
//
// type ModuleWithExamTime = {
//   module: Module,
//   date: ?String,
//   time: ?String,
//   timeSegment: TimeSegment,
// };

type ExamDay = {
  date: Date,
  groupedModules: {
    [TimeSegment]: ModuleWithColor[],
  },
};

/* eslint-disable no-useless-computed-key */
const EXAM_WEEKS = {
  [1]: 2,
  [2]: 2,
  [3]: 1,
  [4]: 1,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getExamDate(date: ?string): ?string {
  if (!date) return null;
  return formatExamDate(date).split(' ')[0];
}

function getExamTime(date: ?string): ?string {
  if (!date) return null;
  const formattedDate = formatExamDate(date);
  return formattedDate.slice(formattedDate.indexOf(' ') + 1);
}

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

function renderWeek(week: ExamDay[], weekNumber: number) {
  const headerRow = (
    <tr>
      {week.map((examDay, dayNumber) => {
        // Format the date number for each day of the exam. We avoid repeating
        // the month unnecessarily by only showing it for the very first cell, and
        // when the month changes
        const { date } = examDay;
        let examDateString = String(date.getDate());
        if ((weekNumber === 0 && dayNumber === 0) || examDateString === '1') {
          examDateString = `${MONTHS[date.getMonth()]} ${examDateString}`;
        }

        return (
          <th className={styles.dayDate} key={examDateString}>
            {examDateString}
          </th>
        );
      })}
    </tr>
  );

  const moduleRows = TIME_SEGMENTS.map((timeSegment) => (
    <tr key={timeSegment}>
      {week.map((day, dayNumber) => {
        const { groupedModules } = day;
        const modules = groupedModules[timeSegment];

        return (
          modules && (
            <td className={styles.day} key={dayNumber}>
              <h4>{timeSegment}</h4>
              {modules.map((module) => <div key={module.ModuleCode}>{renderModule(module)}</div>)}
            </td>
          )
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

export default class ExamTimetable extends PureComponent<Props> {
  getExamCalendar(): [Date, number] {
    const { semester, modules } = this.props;
    const year = `${config.academicYear.slice(2, 4)}/${config.academicYear.slice(-2)}`;
    let weekCount = EXAM_WEEKS[semester];
    let firstDayOfExams = new Date(
      // Add Singapore's tz offset to ensure the date is in the local tz
      NUSModerator.academicCalendar.getExamWeek(year, semester).valueOf() + 8 * 60 * 60 * 1000,
    );
    let lastDayOfExams = daysAfter(firstDayOfExams, weekCount * 7);

    // Check modules for outliers, eg. GER1000 that has exams on the Saturday before the exam week
    // and expand the range accordingly
    modules.forEach((module) => {
      const dateString = getModuleExamDate(module, semester);
      if (!dateString) return;

      const date = new Date(dateString);
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

    const modulesByExamDate = groupBy(this.props.modules, (module) =>
      getExamDate(getModuleExamDate(module, semester)),
    );

    // eslint-disable-next-line
    return range(weekCount).map((week) => {
      // Group by days
      return range(6).map((day) => {
        const date = daysAfter(firstDayOfExams, week * 7 + day);
        const modules = modulesByExamDate[getExamDate(date.toISOString())] || [];

        // Group by time segment
        return {
          date,
          groupedModules: groupBy(modules, (module) => {
            const examDate = getModuleExamDate(module, semester);
            return getTimeSegment(getExamTime(examDate) || 'Error');
          }),
        };
      });
    });
  }

  render() {
    const modulesByExamDate = this.groupModulesByExams();

    return (
      <div className="scrollable">
        <table className={styles.table}>
          <tbody>
            <tr className={styles.daysOfWeek}>
              {range(6).map((day) => (
                <th key={day} className={styles.dayName}>
                  {DaysOfWeek[day].slice(0, 3)}
                </th>
              ))}
            </tr>

            {modulesByExamDate.map(renderWeek)}
          </tbody>
        </table>
      </div>
    );
  }
}
