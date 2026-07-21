import { Dispatch, SetStateAction, useState } from 'react';
import { DayText } from 'types/modules';
import { LessonKey, LessonOption, TimeRange } from 'types/optimiser';

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
  pinnedLessonKeys: Set<LessonKey>;
  setPinnedLessonKeys: Dispatch<SetStateAction<Set<LessonKey>>>;
  freeDays: Set<DayText>;
  setFreeDays: Dispatch<SetStateAction<Set<DayText>>>;
  lessonTimeRange: TimeRange;
  setLessonTimeRange: Dispatch<SetStateAction<TimeRange>>;
  lunchTimeRange: TimeRange;
  setLunchTimeRange: Dispatch<SetStateAction<TimeRange>>;
  maxConsecutiveHours: number;
  setMaxConsecutiveHours: Dispatch<SetStateAction<number>>;
};

// TODO: leslieyip02 - consider using react-hook-form
// https://github.com/nusmodifications/nusmods/pull/4094#discussion_r2209166244
export default function useOptimiserForm(): OptimiserFormFields {
  const [liveLessonOptions, setLiveLessonOptions] = useState<LessonOption[]>([]);
  const [pinnedLessonKeys, setPinnedLessonKeys] = useState(new Set<LessonKey>());
  const [freeDays, setFreeDays] = useState(new Set<DayText>());
  const [lessonTimeRange, setLessonTimeRange] = useState(defaultLessonTimeRange);
  const [maxConsecutiveHours, setMaxConsecutiveHours] = useState(defaultMaxConsecutiveHours);
  const [lunchTimeRange, setLunchTimeRange] = useState(defaultLunchTimeRange);

  return {
    liveLessonOptions,
    setLiveLessonOptions,
    pinnedLessonKeys,
    setPinnedLessonKeys,
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
