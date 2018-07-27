const elements = require('../../views/elements');

module.exports = {
  url() {
    return this.api.launchUrl;
  },

  elements: {
    timetable: `.${elements.timetable}`,
    timetableLessons: `.${elements.lessons}`,
    addModule: `.${elements.addModuleInput}`,
    moduleTable: `.${elements.moduleTable}`,
    examCalendar: `.${elements.examCalendar}`,
    examCalendarBtn: `.${elements.examCalendarBtn}`,
  },
};
