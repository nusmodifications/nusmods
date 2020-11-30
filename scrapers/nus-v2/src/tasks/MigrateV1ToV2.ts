import NUSModerator from 'nusmoderator';

import { RawLesson, Weeks, Module, SemesterData, Semester } from '../types/modules';
import { V1Module, V1RawLesson, V1SemesterData } from '../types/v1';
import { AcademicGrp, AcademicOrg } from '../types/api';
import { getLessonCovidZones, parseWorkload } from './GetSemesterData';
import BaseTask from './BaseTask';
import { Task } from '../types/tasks';
import V1DataReader from '../services/io/v1-io';
import { Logger } from '../services/logger';

interface Input {
  departments: AcademicOrg[];
  faculties: AcademicGrp[];
}

type Output = Module[];

function buildFacultyMap(departments: AcademicOrg[], faculties: AcademicGrp[]) {
  const departmentFaculty: Record<string, string> = {};

  // Map departments to their corresponding faculty. This works because the first three chars of
  // the department code (AcademicOrganization) matches the faculty code (AcademicGroup)
  for (const department of departments) {
    for (const faculty of faculties) {
      if (department.AcademicOrganisation.startsWith(faculty.AcademicGroup)) {
        departmentFaculty[department.Description] = faculty.Description;
      }
    }
  }

  return departmentFaculty;
}

export default class MigrateV1ToV2 extends BaseTask implements Task<Input, Output> {
  name = 'Convert v1 modules to v2 data';

  logger = this.rootLogger.child({
    task: MigrateV1ToV2.name,
    year: this.academicYear,
  });

  private v1DataReader: V1DataReader;

  constructor(academicYear: string) {
    super(academicYear);

    this.v1DataReader = new V1DataReader(academicYear);
  }

  async run(input: Input): Promise<Module[]> {
    const modules = await this.v1DataReader.listModules();
    const departmentFaculty = buildFacultyMap(input.departments, input.faculties);

    const convertedModules = await Promise.all(
      modules.map(async (moduleCode) => {
        const v1Module = await this.v1DataReader.getModule(moduleCode);
        const v2Module = this.convertModule(
          v1Module,
          departmentFaculty,
          this.logger.child({ moduleCode }),
        );
        await this.io.module(moduleCode, v2Module);
        return v2Module;
      }),
    );

    return convertedModules;
  }

  private convertWeekText = (weekText: string, semester: Semester, logger: Logger): Weeks => {
    // For some reason some week text contains NBSP
    const cleanWeekText = weekText.replace(/\s+/g, ' ');
    switch (cleanWeekText) {
      case 'Every Week':
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

      case 'Odd Week':
        return [3, 5, 7, 9, 11, 13];

      case 'Even Week':
        return [2, 4, 6, 8, 10, 12];

      case 'Orientation Week': {
        if (semester !== 1) {
          logger.warn('Orientation week weekText found for module in semester 2');
          return [];
        }

        const date = NUSModerator.academicCalendar.getAcadYearStartDate(this.academicYear);
        return {
          start: date.toISOString(),
          end: date.toISOString(),
        };
      }

      default: {
        const weeks = weekText.split(/,\s*/).map((week) => parseInt(week, 10));
        const filteredWeeks = weeks.filter((week) => !Number.isNaN(week));
        if (filteredWeeks.length !== weeks.length) {
          logger.warn('Invalid week text found', { weekText });
        }
        return filteredWeeks;
      }
    }
  };

  private convertLesson = (
    { ClassNo, LessonType, DayText, StartTime, EndTime, Venue, WeekText }: V1RawLesson,
    semester: Semester,
    logger: Logger,
  ): RawLesson => ({
    classNo: ClassNo,
    lessonType: LessonType,
    day: DayText,
    startTime: StartTime,
    endTime: EndTime,
    weeks: this.convertWeekText(WeekText, semester, logger),
    venue: Venue,
    size: 0,
    covidZone: 'Unknown', // Ah, a more innocent time
  });

  private convertSemesterData = (
    { ExamDate: examDate, Semester: semester, Timetable = [] }: V1SemesterData,
    logger: Logger,
  ): SemesterData => {
    const timetable = Timetable.map((lesson) => this.convertLesson(lesson, semester, logger));
    return {
      examDate,
      semester,
      timetable,
      covidZones: getLessonCovidZones(timetable),
    };
  };

  private convertModule = (
    {
      AcadYear,
      ModuleCode,
      ModuleCredit,
      ModuleTitle,
      History = [],
      Workload,
      Department,
      Prerequisite,
      Corequisite,
      Preclusion,
    }: V1Module,
    departmentFaculty: Record<string, string>,
    logger: Logger,
  ): Module => ({
    acadYear: AcadYear,
    moduleCredit: ModuleCredit,
    moduleCode: ModuleCode,
    title: ModuleTitle,
    department: Department,
    faculty: departmentFaculty[Department] || '',
    semesterData: History.map((semester) => this.convertSemesterData(semester, logger)),
    corequisite: Corequisite,
    prerequisite: Prerequisite,
    preclusion: Preclusion,
    workload: Workload ? parseWorkload(Workload) : undefined,
  });
}
