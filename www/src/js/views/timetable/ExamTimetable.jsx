// @flow
import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import NUSModerator from 'nusmoderator';
import { groupBy, range } from 'lodash';

import type { ModuleWithColor, Semester } from 'types/modules';
import config from 'config';
import { formatExamDate, getModuleExamDate } from 'utils/modules';
import { modulePage } from 'views/routes/paths';
import { DaysOfWeek } from 'types/modules';

import styles from './ExamTimetable.scss';

type Props = {
  semester: Semester,
  modules: ModuleWithColor[],
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

function renderModule(module: ModuleWithColor) {
  return (
    <Link
      to={modulePage(module.ModuleCode, module.ModuleTitle)}
      className={`color-${module.colorIndex}`}
    >
      <div className={styles.moduleCode}>{module.ModuleCode}</div>
      <div className={styles.moduleTitle}>{module.ModuleTitle}</div>
    </Link>
  );
}

export default class ExamTimetable extends PureComponent<Props> {
  render() {
    const { semester } = this.props;
    const year = `${config.academicYear.slice(2, 4)}/${config.academicYear.slice(-2)}`;
    const firstDayOfExams = NUSModerator.academicCalendar.getExamWeek(year, semester);

    const modulesByExamDate = groupBy(this.props.modules, (module) =>
      getExamDate(getModuleExamDate(module, this.props.semester)),
    );

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

            {range(EXAM_WEEKS[semester]).map((week) => (
              <tr className={styles.week}>
                {range(6).map((day) => {
                  // Add Singapore's tz offset to ensure the date is in the local tz
                  const examDate = new Date(firstDayOfExams.valueOf() + 8 * 60 * 60 * 1000);
                  examDate.setDate(firstDayOfExams.getDate() + week * 7 + day);

                  const modules = modulesByExamDate[getExamDate(examDate.toISOString())];
                  let examDateString = String(examDate.getDate());
                  // Show the month in the first cell, or if the month changed
                  if ((week === 0 && day === 0) || examDateString === 1) {
                    examDateString = `${MONTHS[examDate.getMonth()]} ${examDateString}`;
                  }

                  return (
                    <td className={styles.day} key={day}>
                      <h3>{examDateString}</h3>
                      {modules && (
                        <div>
                          {modules.map((module) => (
                            <Fragment key={module.ModuleCode}>
                              <h4>{getExamTime(getModuleExamDate(module, semester))}</h4>
                              <div key={module.ModuleCode}>{renderModule(module)}</div>
                            </Fragment>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
