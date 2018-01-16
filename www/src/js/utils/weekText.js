// @flow

import NUSModerator from 'nusmoderator';
import { noBreak } from 'utils/react';

type AcadWeekInfo = {
  year: string,
  sem: 'Semester 1' | 'Semester 2' | 'Special Sem 1' | 'Special Sem 2',
  type: 'Instructional' | 'Reading' | 'Examination' | 'Recess' | 'Vacation' | 'Orientation',
  num: ?number,
};

export const getWeekText = (acadWeekInfo: AcadWeekInfo) => {
  const parts: Array<string> = [`AY20${acadWeekInfo.year}`];

  // Check for null value (ie. during vacation)
  if (acadWeekInfo.sem) {
    parts.push(noBreak(acadWeekInfo.sem));
  }

  // Do not show the week number if there is only one week, e.g. recess
  // Hide week if week type is 'Instructional'
  const type = acadWeekInfo.type === 'Instructional' ? '' : `${acadWeekInfo.type} `;
  const weekNumber = acadWeekInfo.num || '';
  parts.push(noBreak(`${type}Week ${weekNumber}`));

  return parts;
};

// Put outside render because this only needs to computed on page load.
const weekText = (() => {
  const acadWeekInfo: AcadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  return getWeekText(acadWeekInfo).join(', ').trim();
})();

export default weekText;
