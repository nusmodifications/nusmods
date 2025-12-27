import { useCallback } from 'react';
import { getOptimiserTime, getTimeValues } from 'utils/optimiser';
import { LessonTime } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import OptimiserFormTooltip from './OptimiserFormTooltip';

import styles from './OptimiserTimeRangeSelect.scss';

type TimeRangeSelectProps = {
  id: string;
  currentValue: LessonTime;
  timeValues: LessonTime[];
  setTime: (lessonTime: LessonTime) => void;
};

const OptimiserTimeRangeSelect: React.FC<TimeRangeSelectProps> = ({
  id,
  currentValue,
  timeValues,
  setTime,
}) => (
  <>
    <label htmlFor={id} hidden>
      Choose a time from the given range
    </label>
    <select
      id={id}
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
  </>
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
          <OptimiserFormTooltip content="There will be no live lessons before this time" />
        </h4>

        <OptimiserTimeRangeSelect
          id="earliest-start-time"
          currentValue={lessonTimeRange.earliest}
          timeValues={earliestTimeValues}
          setTime={setEarliestTime}
        />
      </div>

      <div className={styles.timeColumn}>
        <h4 className={styles.optimiserDescription}>
          Latest end time
          <OptimiserFormTooltip content="There will be no live lessons after this time" />
        </h4>

        <OptimiserTimeRangeSelect
          id="latest-end-time"
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
            id="earliest-lunch-time"
            currentValue={lunchTimeRange.earliest}
            timeValues={earliestTimeValues}
            setTime={setEarliestTime}
          />
          to
          <OptimiserTimeRangeSelect
            id="latest-lunch-time"
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
