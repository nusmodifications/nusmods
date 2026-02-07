import { LessonSlot } from 'apis/optimiser';
import { LessonOption } from 'types/optimiser';

export const defaultLectureOption: LessonOption = {
  moduleCode: 'CS1010S',
  lessonType: 'Lecture',
  colorIndex: 0,
  lessonKey: 'CS1010S|Lecture',
  displayText: 'CS1010S Lecture',
  days: ['Wednesday'],
};

export const defaultRecitationOption: LessonOption = {
  moduleCode: 'CS1010S',
  lessonType: 'Recitation',
  colorIndex: 0,
  lessonKey: 'CS1010S|Recitation',
  displayText: 'CS1010S Recitation',
  days: ['Thursday', 'Friday'],
};

export const defaultTutorialOption: LessonOption = {
  moduleCode: 'CS1010S',
  lessonType: 'Tutorial',
  colorIndex: 0,
  lessonKey: 'CS1010S|Tutorial',
  displayText: 'CS1010S Tutorial',
  days: ['Monday', 'Tuesday'],
};

export const defaultLectureSlot: LessonSlot = {
  classNo: '1',
  day: 'Wednesday',
  endTime: '1000',
  lessonType: 'Lecture',
  startTime: '0800',
  venue: 'LT27',
  coordinates: { x: 103.7809, y: 1.2969925 },
  StartMin: 480,
  EndMin: 600,
  DayIndex: 2,
  LessonKey: 'CS1010S|Lecture',
};

export const defaultRecitationSlot: LessonSlot = {
  classNo: '17',
  day: 'Friday',
  endTime: '1800',
  lessonType: 'Recitation',
  startTime: '1700',
  venue: 'BIZ2-0201',
  coordinates: { x: 103.7748, y: 1.2935857 },
  StartMin: 1020,
  EndMin: 1080,
  DayIndex: 4,
  LessonKey: 'CS1010S|Recitation',
};

export const defaultTutorialSlot: LessonSlot = {
  classNo: '16',
  day: 'Monday',
  endTime: '1600',
  lessonType: 'Tutorial',
  startTime: '1500',
  venue: 'BIZ2-0226',
  coordinates: { x: 103.7752, y: 1.2932994 },
  StartMin: 900,
  EndMin: 960,
  DayIndex: 0,
  LessonKey: 'CS1010S|Tutorial',
};
