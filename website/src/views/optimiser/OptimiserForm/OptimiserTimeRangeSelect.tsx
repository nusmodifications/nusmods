import { useCallback } from 'react';
import { getOptimiserTime, getTimeValues } from 'utils/optimiser';
import { LessonTime } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import OptimiserFormTooltip from './OptimiserFormTooltip';

import styles from './OptimiserTimeRangeSelect.scss';

type TimeRangeSelectProps = {
  currentValue: LessonTime;
  timeValues: LessonTime[];
  setTime: (lessonTime: LessonTime) => void;
};

const OptimiserTimeRangeSelect: React.FC<TimeRangeSelectProps> = ({
  currentValue,
  timeValues,
  setTime,
}) => (
  <select
    data-testid="optimiserTimeRangeSelect"
    className={styles.optimiserDropdown}
    value={currentValue}
    onChange={(e) => setTime(e.target.value)}
  >
    {timeValues.map((value) => (
      <option key={value} value={value}>
        {getOptimiserTime(value)}
      </option>
    ))}
  </select>
);

type LessonTimeRangeSelectProps = {
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserLessonTimeRangeSelect: React.FC<LessonTimeRangeSelectProps> = ({
  optimiserFormFields,
}) => {
  const { lessonTimeRange, setLessonTimeRange } = optimiserFormFields;

  const earliestTimeValues = getTimeValues({
    earliest: '0800',
    latest: '2200',
  });
  const setEarliestTime = useCallback(
    (lessonTime: LessonTime) => {
      setLessonTimeRange((prev) => ({ ...prev, earliest: lessonTime }));
    },
    [setLessonTimeRange],
  );

  const latestTimeValues = getTimeValues({
    earliest: '0900',
    latest: '2300',
  });
  const setLatestTime = useCallback(
    (lessonTime: LessonTime) => {
      setLessonTimeRange((prev) => ({ ...prev, latest: lessonTime }));
    },
    [setLessonTimeRange],
  );

  return (
    <section className={styles.timeControls}>
      <div className={styles.timeColumn}>
        <h4 className={styles.optimiserDescription}>
          Earliest start time
          <OptimiserFormTooltip content="There will be no physical class before this time" />
        </h4>

        <OptimiserTimeRangeSelect
          currentValue={lessonTimeRange.earliest}
          timeValues={earliestTimeValues}
          setTime={setEarliestTime}
        />
      </div>

      <div className={styles.timeColumn}>
        <h4 className={styles.optimiserDescription}>
          Latest end time
          <OptimiserFormTooltip content="There will be no physical class after this time" />
        </h4>

        <OptimiserTimeRangeSelect
          currentValue={lessonTimeRange.latest}
          timeValues={latestTimeValues}
          setTime={setLatestTime}
        />
      </div>
    </section>
  );
};

type LunchTimeRangeSelectProps = {
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserLunchTimeRangeSelect: React.FC<LunchTimeRangeSelectProps> = ({
  optimiserFormFields,
}) => {
  const { lunchTimeRange, setLunchTimeRange } = optimiserFormFields;

  const earliestTimeValues = getTimeValues({
    earliest: '1000',
    latest: '1630',
  });
  const setEarliestTime = useCallback(
    (lessonTime: LessonTime) => {
      setLunchTimeRange((prev) => ({ ...prev, earliest: lessonTime }));
    },
    [setLunchTimeRange],
  );

  const latestTimeValues = getTimeValues({
    earliest: '1100',
    latest: '1730',
  });
  const setLatestTime = useCallback(
    (lessonTime: LessonTime) => {
      setLunchTimeRange((prev) => ({ ...prev, latest: lessonTime }));
    },
    [setLunchTimeRange],
  );

  return (
    <section className={styles.timeControls}>
      <div className={styles.timeColumn}>
        <h4 className={styles.optimiserDescription}>
          Preferred lunch break timing range
          <OptimiserFormTooltip content="Prioritises 1-hour lunch breaks in this range" />
        </h4>

        <div className={styles.timeRow}>
          <OptimiserTimeRangeSelect
            currentValue={lunchTimeRange.earliest}
            timeValues={earliestTimeValues}
            setTime={setEarliestTime}
          />
          to
          <OptimiserTimeRangeSelect
            currentValue={lunchTimeRange.latest}
            timeValues={latestTimeValues}
            setTime={setLatestTime}
          />
        </div>
      </div>
    </section>
  );
};

export {
  TimeRangeSelectProps,
  OptimiserTimeRangeSelect,
  OptimiserLessonTimeRangeSelect,
  OptimiserLunchTimeRangeSelect,
};
