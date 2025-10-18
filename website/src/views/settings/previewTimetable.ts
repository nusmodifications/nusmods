import { ColoredLesson, TimetableArrangement } from 'types/timetables';

// A sample timetable used to preview themes on the settings page
const EVERY_WEEK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const previewArrangement: TimetableArrangement<ColoredLesson> = {
  Tuesday: [
    [
      {
        classNo: '2',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Friday',
        startTime: '1000',
        endTime: '1100',
        venue: 'COM1-B113',
        moduleCode: 'CS3235',
        title: 'Computer Security',
        colorIndex: 0,
      },
      {
        classNo: '2',
        lessonType: 'Tutorial',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1100',
        endTime: '1200',
        venue: 'COM1-0208',
        moduleCode: 'CS2108',
        title: 'Introduction to Computer Networks',
        colorIndex: 7,
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Tuesday',
        startTime: '1400',
        endTime: '1600',
        venue: 'LT15',
        moduleCode: 'CS3235',
        title: 'Computer Security',
        colorIndex: 0,
      },
    ],
  ],
  Wednesday: [
    [
      {
        classNo: 'A19',
        lessonType: 'Tutorial',
        weeks: [3, 5, 7, 9, 11],
        day: 'Wednesday',
        startTime: '1000',
        endTime: '1200',
        venue: 'AS1-0207',
        moduleCode: 'GER1000',
        title: 'Quantitative Reasoning',
        colorIndex: 2,
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Wednesday',
        startTime: '1200',
        endTime: '1400',
        venue: 'i3-Aud',
        moduleCode: 'CS2100',
        title: 'Computer Organisation',
        colorIndex: 4,
      },
    ],
  ],
  Monday: [
    [
      {
        classNo: 'J1',
        lessonType: 'Sectional Teaching',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1000',
        endTime: '1300',
        venue: 'BIZ2-0509',
        moduleCode: 'ACC1006',
        title: 'Accounting Information Systems',
        colorIndex: 6,
      },
      {
        classNo: '1',
        lessonType: 'Lecture',
        weeks: EVERY_WEEK,
        day: 'Monday',
        startTime: '1400',
        endTime: '1600',
        venue: 'i3-Aud',
        moduleCode: 'CS2108',
        title: 'Introduction to Computer Networks',
        colorIndex: 7,
      },
    ],
  ],
  Thursday: [[]],
  Friday: [[]],
};

export default previewArrangement;
