// These types are duplicated from `website/src/types`.

export type TimetableOrientation = 'HORIZONTAL' | 'VERTICAL';
export type ColorIndex = number;
export type LessonIndex = number;
export type ColorMapping = { [moduleCode: string]: ColorIndex };
export type ThemeState = Readonly<{
  id: string;
  showTitle: boolean;
  timetableOrientation: TimetableOrientation;
}>;
export type ColorScheme = 'LIGHT_COLOR_SCHEME' | 'DARK_COLOR_SCHEME';
export type Semester = number;
export type ClassNo = string;
export type DayText = string;
export type LessonTime = string;
export type LessonType = string;
export type ModuleCode = string;
export type ModuleTitle = string;
export type Venue = string;

export type WeekRange = {
  start: string;
  end: string;
  weekInterval?: number;
  weeks?: number[];
};

export type Weeks = number[] | WeekRange;

export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  startTime: LessonTime;
  endTime: LessonTime;
  lessonType: LessonType;
  venue: Venue;
  weeks: Weeks;
}>;

export type SemesterData = {
  semester: Semester;
  timetable: readonly RawLesson[];
  examDate?: string;
  examDuration?: number;
};

export type Module = {
  moduleCode: ModuleCode;
  title: ModuleTitle;
  moduleCredit: string;
  semesterData: readonly SemesterData[];
};

export type ModuleLessonConfig = {
  [lessonType: LessonType]: LessonIndex[];
};

export type SemTimetableConfig = {
  [moduleCode: ModuleCode]: ModuleLessonConfig;
};

// `ExportData` is duplicated from `website/src/types/export.ts`.
export type ExportData = {
  readonly colors: ColorMapping;
  readonly hidden: ModuleCode[];
  readonly semester: Semester;
  readonly settings: {
    colorScheme: ColorScheme;
  };
  readonly ta: ModuleCode[];
  readonly theme: ThemeState;
  readonly timetable: SemTimetableConfig;
};

export type ViewportOptions = {
  pixelRatio?: number;
  width?: number;
  height?: number;
};

export interface State {
  data: ExportData;
}
