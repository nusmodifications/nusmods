import { useCallback } from 'react';
import { getOptimiserTime, getTimeValues } from 'utils/optimiser';
import { LessonTime } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';

import styles from './OptimiserTimeRangeSelect.scss';
import OptimiserFormTooltip from './OptimiserFormTooltip';

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
    className={styles.optimiserDropdown}
    value={currentValue}
    onChange={(e) => setTime(e.target.value)}
  >
    {timeValues.map((value) => (
      <option value={value}>{getOptimiserTime(value)}</option>
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
        <span className={styles.optimiserDescription}>
          <h4>Earliest start time</h4>
          <OptimiserFormTooltip content="There will be no physical class before this time" />
        </span>

        <OptimiserTimeRangeSelect
          currentValue={lessonTimeRange.earliest}
          timeValues={earliestTimeValues}
          setTime={setEarliestTime}
        />
      </div>

      <div className={styles.timeColumn}>
        <span className={styles.optimiserDescription}>
          <h4>Latest end time</h4>
          <OptimiserFormTooltip content="There will be no physical class after this time" />
        </span>

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
        <span className={styles.optimiserDescription}>
          <h4>Select maximum consecutive hours of live lessons</h4>
          <OptimiserFormTooltip content="Prioritises having less than this number of consecutive hours of live lessons" />
        </span>

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

export { OptimiserLessonTimeRangeSelect, OptimiserLunchTimeRangeSelect };
