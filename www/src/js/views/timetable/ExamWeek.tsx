import { range } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ModuleWithColor } from 'types/modules';
import { ModuleWithExamTime } from 'types/views';
import { TIME_SEGMENTS } from 'types/views';
import { formatExamDate } from 'utils/modules';
import { daysAfter } from 'utils/timify';
import { modulePage } from 'views/routes/paths';
import styles from 'views/timetable/ExamCalendar.scss';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  modules: { [key: string]: ModuleWithExamTime[] };
  weekNumber: number;
  firstDayOfExams: Date;
  days: number;
};

function getExamDate(date: Date): string {
  return formatExamDate(date.toISOString()).split(' ')[0];
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

export default function ExamWeek(props: Props) {
  const { modules, weekNumber, firstDayOfExams, days } = props;

  // Array of dates to display
  const dayDates = range(days).map((offset) => daysAfter(firstDayOfExams, weekNumber * 7 + offset));

  // Start counting months using the last day of the previous week, or null if
  // this is the very first week, so the month always gets displayed on the
  // first cell
  const lastDayOfLastWeekOffset = (weekNumber - 1) * 7 + days - 1;
  let currentMonth =
    weekNumber === 0 ? null : daysAfter(firstDayOfExams, lastDayOfLastWeekOffset).getMonth();

  // Each week consists of a header row and three module rows, one for each possible time segment
  const headerRow = (
    <tr className={styles.timeRow}>
      {dayDates.map((date) => {
        // Show the month name when the month changes on the calendar
        let examDateString = String(date.getUTCDate());
        if (currentMonth !== date.getMonth()) {
          examDateString = `${MONTHS[date.getUTCMonth()]} ${examDateString}`;
          currentMonth = date.getMonth();
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
          <td className={styles.day} key={date.getTime()}>
            {!!modulesAtThisTime.length && (
              <>
                <h4>{modulesAtThisTime[0].time}</h4>
                {modulesAtThisTime.map(({ module }) => (
                  <ExamModule key={module.ModuleCode} module={module} />
                ))}
              </>
            )}
          </td>
        );
      })}
    </tr>
  ));

  return (
    <>
      {headerRow}
      {moduleRows}
    </>
  );
}
