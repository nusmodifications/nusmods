const elements = require('../../views/elements');

module.exports = {
  url() {
    return this.api.launchUrl;
  },

  elements: {
    timetable: `.${elements.timetable}`,
    timetableLessons: `.${elements.lessons}`,
    addModuleBtn: `.${elements.addModuleInput}`,
    addModuleInput: `input.${elements.addModuleInput}`,
    moduleTable: `.${elements.moduleTable}`,
    examCalendar: `.${elements.examCalendar}`,
    examCalendarBtn: `.${elements.examCalendarBtn}`,
  },
};
