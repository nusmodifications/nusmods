import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { TimeRange } from 'types/optimiser';

import classNames from 'classnames';
import { getLessonTimeHours, getLessonTimeMinutes } from 'utils/timify';
import { getTimeValues } from 'utils/optimiser';
import { LessonTime } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import Tooltip from 'views/components/Tooltip';
import { Info } from 'react-feather';

import styles from './OptimiserTimeRangeSelect.scss';

type TimeRangeSelectProps = {
  earliestTimeValues: LessonTime[];
  latestTimeValues: LessonTime[];
  timeRange: TimeRange;
  setTimeRange: Dispatch<SetStateAction<TimeRange>>;
};

const OptimiserTimeRangeSelect: React.FC<TimeRangeSelectProps> = ({
  earliestTimeValues,
  latestTimeValues,
  timeRange,
  setTimeRange,
}) => {
  const setTimeRangeEarliest = useCallback(
    (value: LessonTime) => {
      setTimeRange((prev) => ({ ...prev, earliest: value }));
    },
    [setTimeRange],
  );

  const setTimeRangeLatest = useCallback(
    (value: LessonTime) => {
      setTimeRange((prev) => ({ ...prev, latest: value }));
    },
    [setTimeRange],
  );

  return (
    <div className={styles.lunchControlRow}>
      <select
        className={classNames('form-select', styles.timeSelect)}
        value={timeRange.earliest}
        onChange={(e) => setTimeRangeEarliest(e.target.value)}
      >
        {earliestTimeValues.map((value) => {
          const hh = getLessonTimeHours(value);
          const mm = getLessonTimeMinutes(value);
          return <option value={value}>{`${hh}:${mm}`}</option>;
        })}
      </select>
      <div className={styles.lunchTimeSeparator}>to</div>
      <select
        className={classNames('form-select', styles.timeSelect)}
        value={timeRange.earliest}
        onChange={(e) => setTimeRangeLatest(e.target.value)}
      >
        {latestTimeValues.map((value) => {
          const hh = getLessonTimeHours(value);
          const mm = getLessonTimeMinutes(value);
          return <option value={value}>{`${hh}:${mm}`}</option>;
        })}
      </select>
    </div>
  );
};

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
  const latestTimeValues = getTimeValues({
    earliest: '0900',
    latest: '2300',
  });

  return (
    <div className={styles.timeControls}>
      <div className={styles.timeControlWrapper}>
        <div className={styles.timeControlGroup}>
          <div className={styles.timeControlHeader}>
            Earliest start time
            <Tooltip content="There will be no physical class before this time" placement="right">
              <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
            </Tooltip>
            <div className={styles.timeControlHeader}>
              Latest end time
              <Tooltip content="There will be no physical class after this time" placement="right">
                <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
              </Tooltip>
            </div>
          </div>
          <OptimiserTimeRangeSelect
            earliestTimeValues={earliestTimeValues}
            latestTimeValues={latestTimeValues}
            timeRange={lessonTimeRange}
            setTimeRange={setLessonTimeRange}
          />
        </div>
      </div>
    </div>
  );
};

type LunchTimeRangeSelectProps = {
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserLunchTimeRangeSelect: React.FC<LunchTimeRangeSelectProps> = ({
  optimiserFormFields,
}) => {
  const { lessonTimeRange, setLessonTimeRange } = optimiserFormFields;

  const earliestTimeValues = getTimeValues({
    earliest: '1000',
    latest: '1630',
  });
  const latestTimeValues = getTimeValues({
    earliest: '1100',
    latest: '1730',
  });

  return (
    <div className={styles.timeControls}>
      <div className={styles.timeControlWrapper}>
        <div className={styles.timeControlGroup}>
          <div className={styles.timeControlHeader}>
            Earliest start time
            <Tooltip content="There will be no physical class before this time" placement="right">
              <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
            </Tooltip>
            <div className={styles.timeControlHeader}>
              Latest end time
              <Tooltip content="There will be no physical class after this time" placement="right">
                <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
              </Tooltip>
            </div>
          </div>
          <OptimiserTimeRangeSelect
            earliestTimeValues={earliestTimeValues}
            latestTimeValues={latestTimeValues}
            timeRange={lessonTimeRange}
            setTimeRange={setLessonTimeRange}
          />
        </div>
      </div>
    </div>
  );
};

export { OptimiserLessonTimeRangeSelect, OptimiserLunchTimeRangeSelect };
