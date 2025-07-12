import { Dispatch, SetStateAction, useState } from 'react';
import { DayText } from 'types/modules';
import { LessonOption, TimeRange } from 'types/optimiser';

const defaultLessonTimeRange: TimeRange = {
  earliest: '0800',
  latest: '1900',
};

const defaultLunchTimeRange: TimeRange = {
  earliest: '1200',
  latest: '1400',
};

const defaultMaxConsecutiveHours = 4;

export type OptimiserFormFields = {
  liveLessonOptions: LessonOption[];
  setLiveLessonOptions: Dispatch<SetStateAction<LessonOption[]>>;
  freeDays: Set<DayText>;
  setFreeDays: Dispatch<SetStateAction<Set<DayText>>>;
  lessonTimeRange: TimeRange;
  setLessonTimeRange: Dispatch<SetStateAction<TimeRange>>;
  lunchTimeRange: TimeRange;
  setLunchTimeRange: Dispatch<SetStateAction<TimeRange>>;
  maxConsecutiveHours: number;
  setMaxConsecutiveHours: Dispatch<SetStateAction<number>>;
};

export default function useOptimiserForm(): OptimiserFormFields {
  const [liveLessonOptions, setLiveLessonOptions] = useState<LessonOption[]>([]);
  const [freeDays, setFreeDays] = useState<Set<DayText>>(new Set());
  const [lessonTimeRange, setLessonTimeRange] = useState(defaultLessonTimeRange);
  const [maxConsecutiveHours, setMaxConsecutiveHours] = useState(defaultMaxConsecutiveHours);
  const [lunchTimeRange, setLunchTimeRange] = useState(defaultLunchTimeRange);

  return {
    liveLessonOptions,
    setLiveLessonOptions,
    freeDays,
    setFreeDays,
    lessonTimeRange,
    setLessonTimeRange,
    lunchTimeRange,
    setLunchTimeRange,
    maxConsecutiveHours,
    setMaxConsecutiveHours,
  };
}
