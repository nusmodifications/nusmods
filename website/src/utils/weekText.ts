import NUSModerator, { AcadWeekInfo } from 'nusmoderator';
import { noBreak } from 'utils/react';

export const getWeekText = (acadWeekInfo: AcadWeekInfo) => {
  const parts: string[] = [`AY20${acadWeekInfo.year}`];

  // Check for null value (ie. during vacation)
  if (acadWeekInfo.sem) {
    parts.push(noBreak(acadWeekInfo.sem));
  }

  // Do not show the week number if there is only one week, e.g. recess
  // Hide week if week type is 'Instructional'
  const type = acadWeekInfo.type === 'Instructional' ? '' : `${acadWeekInfo.type} `;
  const weekNumber = acadWeekInfo.num || '';
  parts.push(noBreak(`${type}Week ${weekNumber}`));

  return parts.join(', ').trim();
};

// Text computed in an IIFE because this only needs to be computed on page load.
const weekText = (() => {
  const acadWeekInfo = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
  return getWeekText(acadWeekInfo);
})();

export default weekText;
