import { RawLesson, Weeks, Module, SemesterData } from '../types/modules';
import { V1Module, V1RawLesson, V1SemesterData } from '../types/v1';
import { AcademicGrp, AcademicOrg } from '../types/api';
import { parseWorkload } from './GetSemesterData';
import BaseTask from './BaseTask';
import { Task } from '../types/tasks';
import V1DataReader from '../services/v1-io';

function convertWeekText(weekText: string): Weeks {
  switch (weekText) {
    case 'Every Week':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    case 'Odd Week':
      return [3, 5, 7, 9, 11, 13];
    case 'Even Week':
      return [2, 4, 6, 8, 10, 12];
    default:
      return weekText.split(/,\s*/).map((week) => parseInt(week, 10));
  }
}

function convertLesson({
  ClassNo,
  LessonType,
  DayText,
  StartTime,
  EndTime,
  Venue,
  WeekText,
}: V1RawLesson): RawLesson {
  return {
    classNo: ClassNo,
    lessonType: LessonType,
    day: DayText,
    startTime: StartTime,
    endTime: EndTime,
    weeks: convertWeekText(WeekText),
    venue: Venue,
    size: 0,
  };
}

function convertSemesterData({ ExamDate, Semester, Timetable }: V1SemesterData): SemesterData {
  return {
    examDate: ExamDate,
    semester: Semester,
    timetable: Timetable.map(convertLesson),
  };
}

function convertModule(
  {
    AcadYear,
    ModuleCode,
    ModuleCredit,
    ModuleTitle,
    History,
    Workload,
    Department,
    Prerequisite,
    Corequisite,
    Preclusion,
  }: V1Module,
  departmentFaculty: Record<string, string>,
): Module {
  return {
    acadYear: AcadYear,
    moduleCredit: ModuleCredit,
    moduleCode: ModuleCode,
    title: ModuleTitle,
    department: Department,
    faculty: departmentFaculty[Department],
    semesterData: History.map(convertSemesterData),
    corequisite: Corequisite,
    prerequisite: Prerequisite,
    preclusion: Preclusion,
    workload: Workload ? parseWorkload(Workload) : undefined,
  };
}

interface Input {
  departments: AcademicOrg[];
  faculties: AcademicGrp[];
}

type Output = Module[];

export default class MigrateV1ToV2 extends BaseTask implements Task<Input, Output> {
  name = 'Convert v1 modules to v2 data';
  private v1DataReader: V1DataReader;

  constructor(academicYear: string) {
    super(academicYear);

    this.v1DataReader = new V1DataReader(academicYear);
  }

  async run(input: Input): Promise<Module[]> {
    const modules = await this.v1DataReader.listModules();

    const convertedModules = await Promise.all(
      modules.map(async (moduleCode) =>
        convertModule(await this.v1DataReader.getModule(moduleCode)),
      ),
    );

    return convertedModules;
  }
}
