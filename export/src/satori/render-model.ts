import type {
  ColorMapping,
  ColorScheme,
  ExportData,
  LessonIndex,
  LessonType,
  Module,
  ModuleCode,
  Semester,
} from '../types';
import { getLessonPalette } from './theme';

export type RenderableLesson = {
  classNo: string;
  color: string;
  displayTitle: string;
  endIndex: number;
  isTa: boolean;
  key: string;
  lessonMeta: string;
  moduleCode: ModuleCode;
  startIndex: number;
  venue: string;
  weekText: string | null;
};

export type RenderableDay = {
  day: string;
  rows: RenderableLesson[][];
};

export type RenderableModuleCard = {
  color: string;
  isHidden: boolean;
  isTa: boolean;
  metaLine: string;
  moduleCode: ModuleCode;
  moduleCredit: number;
  sortKey: number;
  title: string;
};

export type RenderableTimetable = {
  activeUnits: number;
  colorScheme: ColorScheme;
  days: RenderableDay[];
  endingIndex: number;
  isVertical: boolean;
  timeLabels: { index: number; label: string }[];
  moduleCards: RenderableModuleCard[];
  showTitle: boolean;
  startingIndex: number;
  themeId: string;
  totalUnits: number;
};

const NUM_DIFFERENT_COLORS = 8;
const INTERVALS_PER_HOUR = 4;
const DEFAULT_EARLIEST_INDEX = 10 * INTERVALS_PER_HOUR;
const DEFAULT_LATEST_INDEX = 18 * INTERVALS_PER_HOUR;
const SCHOOLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const LESSON_TYPE_ABBREV: Record<string, string> = {
  'Design Lecture': 'DLEC',
  Laboratory: 'LAB',
  Lecture: 'LEC',
  'Packaged Laboratory': 'PLAB',
  'Packaged Lecture': 'PLEC',
  'Packaged Tutorial': 'PTUT',
  Recitation: 'REC',
  'Sectional Teaching': 'SEC',
  'Seminar-Style Module Class': 'SEM',
  Tutorial: 'TUT',
  'Tutorial Type 2': 'TUT2',
  'Tutorial Type 3': 'TUT3',
  Workshop: 'WS',
};

type LessonWithDisplay = {
  classNo: string;
  color: string;
  day: string;
  displayTitle: string;
  endTime: string;
  isTa: boolean;
  lessonType: LessonType;
  moduleCode: ModuleCode;
  startTime: string;
  title: string;
  venue: string;
  weekText: string | null;
};

function getNewColor(currentColors: number[]): number {
  let availableColors = Array.from({ length: NUM_DIFFERENT_COLORS }, (_, index) => index);
  for (const index of currentColors) {
    availableColors = availableColors.filter((color) => color !== index);
    if (availableColors.length === 0) {
      availableColors = Array.from({ length: NUM_DIFFERENT_COLORS }, (_, color) => color);
    }
  }
  return availableColors[0] ?? 0;
}

function fillColorMapping(
  timetable: ExportData['timetable'],
  original: ColorMapping,
): ColorMapping {
  const colorMap: ColorMapping = {};
  const colorsUsed: number[] = [];

  for (const moduleCode of Object.keys(timetable)) {
    if (moduleCode in original) {
      colorMap[moduleCode] = original[moduleCode];
      colorsUsed.push(Number(original[moduleCode]));
    } else {
      const color = getNewColor(colorsUsed);
      colorMap[moduleCode] = color;
      colorsUsed.push(color);
    }
  }

  return colorMap;
}

function getSemesterData(module: Module, semester: Semester) {
  return module.semesterData.find((semesterData) => semesterData.semester === semester);
}

function convertTimeToIndex(time: string): number {
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(2));
  return hour * INTERVALS_PER_HOUR + Math.round(minute / 15);
}

function convertIndexToTime(index: number) {
  const hour = Math.floor(index / INTERVALS_PER_HOUR);
  const minute = (index % INTERVALS_PER_HOUR) * 15;
  return `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
}

function calculateBorderTimings(lessons: readonly LessonWithDisplay[]) {
  let earliestIndex = DEFAULT_EARLIEST_INDEX;
  let latestIndex = DEFAULT_LATEST_INDEX;

  for (const lesson of lessons) {
    earliestIndex = Math.min(earliestIndex, convertTimeToIndex(lesson.startTime));
    latestIndex = Math.max(latestIndex, convertTimeToIndex(lesson.endTime));
  }

  return {
    startingIndex: earliestIndex - (earliestIndex % INTERVALS_PER_HOUR),
    endingIndex: Math.ceil(latestIndex / INTERVALS_PER_HOUR) * INTERVALS_PER_HOUR,
  };
}

function doLessonsOverlap(left: LessonWithDisplay, right: LessonWithDisplay) {
  return left.day === right.day && left.startTime < right.endTime && right.startTime < left.endTime;
}

function arrangeLessonsWithinDay(lessons: LessonWithDisplay[]) {
  const rows: LessonWithDisplay[][] = [[]];

  if (!lessons.length) {
    return rows;
  }

  const sortedLessons = [...lessons].sort((left, right) => {
    const timeDiff = left.startTime.localeCompare(right.startTime);
    return timeDiff !== 0 ? timeDiff : left.classNo.localeCompare(right.classNo);
  });

  sortedLessons.forEach((lesson) => {
    for (const row of rows) {
      const previousLesson = row[row.length - 1];
      if (!previousLesson || !doLessonsOverlap(previousLesson, lesson)) {
        row.push(lesson);
        return;
      }
    }

    rows.push([lesson]);
  });

  return rows;
}

function formatModuleUnits(moduleCredit: number) {
  return `${moduleCredit} ${moduleCredit === 1 ? 'Unit' : 'Units'}`;
}

function formatNumericWeeks(unprocessedWeeks: number[]): string | null {
  const weeks = unprocessedWeeks.filter(
    (value, index) => unprocessedWeeks.indexOf(value) === index,
  );

  if (weeks.length === 13) return null;
  if (weeks.length === 1) return `Week ${weeks[0]}`;

  const deltas = weeks.slice(1).map((week, index) => week - weeks[index]);
  if (deltas.every((delta) => delta === 2)) {
    if (weeks[0] % 2 === 0 && weeks.length >= 6) return 'Even Weeks';
    if (weeks[0] % 2 === 1 && weeks.length >= 7) return 'Odd Weeks';
  }

  const processed: (number | string)[] = [];
  let start = weeks[0] ?? 0;
  let end = start;

  const mergeConsecutive = () => {
    if (end - start > 2) {
      processed.push(`${start}-${end}`);
    } else {
      for (let week = start; week <= end; week += 1) {
        processed.push(week);
      }
    }
  };

  weeks.slice(1).forEach((week) => {
    if (week === end + 1) {
      end = week;
    } else {
      mergeConsecutive();
      start = week;
      end = week;
    }
  });

  mergeConsecutive();
  return `Weeks ${processed.join(', ')}`;
}

function formatWeeks(
  weeks: Module['semesterData'][number]['timetable'][number]['weeks'],
): string | null {
  if (Array.isArray(weeks)) {
    return formatNumericWeeks(weeks);
  }

  if (weeks.weeks?.length) {
    return formatNumericWeeks(weeks.weeks);
  }

  if (weeks.weekInterval === 2) {
    const startWeek = 1;
    return startWeek % 2 === 0 ? 'Even Weeks' : 'Odd Weeks';
  }

  return null;
}

function formatExamDate(examDate?: string) {
  if (!examDate) return 'No Exam';

  const date = new Date(examDate);
  const datePart = new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Singapore',
    year: 'numeric',
  })
    .format(date)
    .replace(/ /g, '-');

  const timePart = new Intl.DateTimeFormat('en-SG', {
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    timeZone: 'Asia/Singapore',
  }).format(date);

  return `${datePart} ${timePart}`;
}

function formatExamDuration(examDuration?: number) {
  if (!examDuration) return null;
  if (examDuration < 60 || examDuration % 30 !== 0) return `${examDuration} mins`;

  const hours = examDuration / 60;
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
}

function buildLessonMeta(lessonType: LessonType, classNo: string) {
  return `${LESSON_TYPE_ABBREV[lessonType] ?? lessonType} [${classNo}]`;
}

function buildLessonDisplayTitle(
  moduleCode: ModuleCode,
  title: string,
  showTitle: boolean,
  isTa: boolean,
) {
  const baseTitle = showTitle ? `${moduleCode} ${title}` : moduleCode;
  return isTa ? `${baseTitle} (TA)` : baseTitle;
}

function buildRenderableLessons(
  exportData: ExportData,
  modulesByCode: Map<ModuleCode, Module>,
  colorMap: ColorMapping,
  effectiveShowTitle: boolean,
) {
  const palette = getLessonPalette(exportData.theme.id);
  const lessons: LessonWithDisplay[] = [];

  for (const [moduleCode, lessonConfig] of Object.entries(exportData.timetable)) {
    const module = modulesByCode.get(moduleCode);
    if (!module || exportData.hidden.includes(moduleCode)) {
      continue;
    }

    const semesterData = getSemesterData(module, exportData.semester);
    if (!semesterData?.timetable?.length) {
      continue;
    }

    const colorIndex = colorMap[moduleCode] ?? 0;
    const color = palette[colorIndex % palette.length] ?? palette[0] ?? '#6699cc';
    const isTa = exportData.ta.includes(moduleCode);

    for (const lessonIndices of Object.values(lessonConfig)) {
      for (const lessonIndex of lessonIndices) {
        const lesson = semesterData.timetable[lessonIndex as LessonIndex];
        if (!lesson) continue;

        lessons.push({
          classNo: lesson.classNo,
          color,
          day: lesson.day,
          displayTitle: buildLessonDisplayTitle(
            module.moduleCode,
            module.title,
            effectiveShowTitle,
            isTa,
          ),
          endTime: lesson.endTime,
          isTa,
          lessonType: lesson.lessonType,
          moduleCode,
          startTime: lesson.startTime,
          title: module.title,
          venue: lesson.venue.startsWith('E-Learn') ? 'E-Learning' : lesson.venue,
          weekText: formatWeeks(lesson.weeks),
        });
      }
    }
  }

  return lessons;
}

function buildModuleCards(
  exportData: ExportData,
  modulesByCode: Map<ModuleCode, Module>,
  colorMap: ColorMapping,
) {
  const palette = getLessonPalette(exportData.theme.id);

  return Object.keys(exportData.timetable)
    .map((moduleCode): RenderableModuleCard | null => {
      const module = modulesByCode.get(moduleCode);
      if (!module) return null;

      const semesterData = getSemesterData(module, exportData.semester);
      const moduleCredit = Number.parseFloat(module.moduleCredit);
      const colorIndex = colorMap[moduleCode] ?? 0;
      const examDate = semesterData?.examDate;
      const examDuration = formatExamDuration(semesterData?.examDuration);
      const metaParts = [examDate ? `Exam: ${formatExamDate(examDate)}` : 'No Exam'];

      if (examDuration) metaParts.push(examDuration);
      metaParts.push(formatModuleUnits(moduleCredit));

      return {
        color: palette[colorIndex % palette.length] ?? palette[0] ?? '#6699cc',
        isHidden: exportData.hidden.includes(moduleCode),
        isTa: exportData.ta.includes(moduleCode),
        metaLine: metaParts.join(' • '),
        moduleCode,
        moduleCredit,
        sortKey: examDate ? new Date(examDate).getTime() : Number.MIN_SAFE_INTEGER,
        title: module.title,
      };
    })
    .filter((module): module is RenderableModuleCard => Boolean(module))
    .sort((left, right) => {
      if (left.sortKey !== right.sortKey) return left.sortKey - right.sortKey;
      return left.moduleCode.localeCompare(right.moduleCode);
    });
}

export function buildRenderableTimetable(
  exportData: ExportData,
  modules: Module[],
): RenderableTimetable {
  const modulesByCode = new Map(modules.map((module) => [module.moduleCode, module]));
  const colorMap = fillColorMapping(exportData.timetable, exportData.colors);
  const isVertical = exportData.theme.timetableOrientation === 'VERTICAL';
  const effectiveShowTitle = !isVertical && exportData.theme.showTitle;
  const lessons = buildRenderableLessons(exportData, modulesByCode, colorMap, effectiveShowTitle);
  const { startingIndex, endingIndex } = calculateBorderTimings(lessons);

  const lessonsByDay = new Map<string, LessonWithDisplay[]>();
  for (const lesson of lessons) {
    const dayLessons = lessonsByDay.get(lesson.day) ?? [];
    dayLessons.push(lesson);
    lessonsByDay.set(lesson.day, dayLessons);
  }

  const days = SCHOOLDAYS.filter((day) => day !== 'Saturday' || lessonsByDay.has('Saturday')).map(
    (day) => ({
      day,
      rows: arrangeLessonsWithinDay(lessonsByDay.get(day) ?? []).map((row) =>
        row.map((lesson) => ({
          classNo: lesson.classNo,
          color: lesson.color,
          displayTitle: lesson.displayTitle,
          endIndex: convertTimeToIndex(lesson.endTime),
          isTa: lesson.isTa,
          key: `${lesson.moduleCode}-${lesson.lessonType}-${lesson.classNo}-${lesson.startTime}`,
          lessonMeta: buildLessonMeta(lesson.lessonType, lesson.classNo),
          moduleCode: lesson.moduleCode,
          startIndex: convertTimeToIndex(lesson.startTime),
          venue: lesson.venue,
          weekText: lesson.weekText,
        })),
      ),
    }),
  );

  const moduleCards = buildModuleCards(exportData, modulesByCode, colorMap);
  const totalUnits = moduleCards.reduce((sum, module) => sum + module.moduleCredit, 0);
  const activeUnits = moduleCards
    .filter((module) => !module.isHidden && !module.isTa)
    .reduce((sum, module) => sum + module.moduleCredit, 0);

  return {
    activeUnits,
    colorScheme: exportData.settings.colorScheme,
    days,
    endingIndex,
    isVertical,
    timeLabels: Array.from(
      { length: (endingIndex - startingIndex) / INTERVALS_PER_HOUR },
      (_, offset) => {
        const index = startingIndex + offset * INTERVALS_PER_HOUR;
        return {
          index,
          label: convertIndexToTime(index),
        };
      },
    ),
    moduleCards,
    showTitle: effectiveShowTitle,
    startingIndex,
    themeId: exportData.theme.id,
    totalUnits,
  };
}
