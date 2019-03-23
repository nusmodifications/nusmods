import {
  ClassNo,
  DayText,
  EndTime,
  LessonType,
  ModuleCode,
  ModuleTitle,
  StartTime,
  Venue,
  Weeks,
} from './modulesBase';

// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = Readonly<{
  classNo: ClassNo;
  day: DayText;
  startTime: StartTime;
  endTime: EndTime;
  lessonType: LessonType;
  venue: Venue;
  weeks: Weeks;
}>;

// RawLessons obtained from API does not include ModuleCode and ModuleTitle by default.
// They have to be injected in before using in the timetable.
export type Lesson = RawLesson & {
  moduleCode: ModuleCode;
  title: ModuleTitle;
};

export type ColoredLesson = Lesson & {
  colorIndex: number;
};

type Modifiable = {
  isModifiable?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
  colorIndex: number;
};

// Lessons do not implement a modifiable interface.
export type ModifiableLesson = ColoredLesson & Modifiable;
