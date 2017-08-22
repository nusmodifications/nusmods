// @flow
import type {
  Lesson,
  Module,
  ModuleCode,
  RawLesson,
  Semester,
  SemesterData,
  WorkloadComponent,
  Time,
  Day,
} from 'types/modules';
import _ from 'lodash';
import config from 'config';

export function modulePagePath(moduleCode: ModuleCode): string {
  return `/modules/${moduleCode}`;
}

// Returns semester specific details such as exam date and timetable.
export function getModuleSemesterData(module: Module, semester: Semester): ?SemesterData {
  return module.History.find((semData: SemesterData) => {
    return semData.Semester === semester;
  });
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module: Module, semester: Semester): Array<RawLesson> {
  return _.get(getModuleSemesterData(module, semester), 'Timetable');
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1: Lesson, lesson2: Lesson): boolean {
  return lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType;
}

// Convert exam in ISO format to 12-hour date/time format. We slice off the
// SGT time zone and interpret as UTC time, then use the getUTC* methods so
// that they will correspond to Singapore time regardless of the local time
// zone.
export function formatExamDate(examDate: string): string {
  const date: Date = new Date(`${examDate.slice(0, 16)}Z`);
  const hours: number = date.getUTCHours();

  const day: string = _.padStart(`${date.getUTCDate().toString()}`, 2, '0');
  const month: string = _.padStart(`${date.getUTCMonth() + 1}`, 2, '0');
  const year: number = date.getUTCFullYear();
  const hour: number = (hours % 12 || 12);
  const minute: string = _.padStart(`${date.getUTCMinutes()}`, 2, '0');
  const amPm: string = (hours < 12 ? 'AM' : 'PM');
  return `${day}-${month}-${year} ${hour}:${minute} ${amPm}`;
}

export function getModuleSemExamDate(module: Module, semester: Semester): string {
  const examDate = _.get(getModuleSemesterData(module, semester), 'ExamDate');
  return examDate ? formatExamDate(examDate) : '-';
}

// Returns the current semester if it is found in semesters, or the first semester
// where it is available
export function getFirstAvailableSemester(
  semesters: SemesterData[],
  current: Semester = config.semester, // For testing only
): Semester {
  const availableSemesters = semesters.map(semesterData => semesterData.Semester);
  return availableSemesters.includes(current) ? current : _.min(availableSemesters);
}

// Parse the workload string into individual components
export type Workload = { [WorkloadComponent]: number } | string;
export function parseWorkload(workloadString: string): Workload {
  const cleanedWorkloadString = workloadString
    .replace(/\(.*?\)/g, '') // Remove stuff in parenthesis
    .replace(/NA/g, '0') // Replace 'NA' with 0
    .replace(/\s+/g, ''); // Remove whitespace

  if (!/((^|-)([\d.]+)){5}/.test(cleanedWorkloadString)) return workloadString;
  // Workload string is formatted as A-B-C-D-E where
  // A: no. of lecture hours per week
  // B: no. of tutorial hours per week
  // C: no. of laboratory hours per week
  // D: no. of hours for projects, assignments, fieldwork etc per week
  // E: no. of hours for preparatory work by a student per week
  // Taken from CORS:
  // https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2017/2018&sem_c=1&mod_c=CS2105
  const hours = workloadString.split('-');
  const components = ['Lecture', 'Tutorial', 'Laboratory', 'Project', 'Preparation'];

  const workload = {};
  _.zip(components, hours).forEach(([component, hourString]) => {
    const hour = parseFloat(hourString);
    if (!hour) return;
    workload[component] = hour;
  });

  return workload;
}

export function getTimeslot(day: Day, time: Time): string {
  return `${day} ${time}`;
}
