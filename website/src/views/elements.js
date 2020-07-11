// Used to share classnames with e2e tests. This allows the e2e tests to select
// and assert against elements, which would be difficult to do otherwise because
// we use CSS modules, which mangles the classnames.

const elements = {
  // Global
  timetable: 'timetable',
  lessons: 'timetable-cell',

  // Timetable page
  addModuleInput: 'add-module-input',
  moduleTable: 'module-table',
  examCalendar: 'exam-calendar',
  examCalendarBtn: 'exam-calendar-btn',

  // Module finder
  moduleFinderSearchBox: 'module-finder-input',
  moduleResultItem: 'module-result-item',
};

module.exports = elements;
