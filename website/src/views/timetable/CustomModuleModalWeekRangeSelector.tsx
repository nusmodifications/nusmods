import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { WeekRange } from 'types/modules';
import DateField from 'views/components/DateField';
import { parseISO } from 'date-fns';
import styles from './CustomModuleModalWeekRangeSelector.scss';

interface CustomModuleModalWeekRangeSelectorProps {
  defaultWeekRange: WeekRange;
  onChange: (weekRange: WeekRange) => void;
  error?: string;
}

const CustomModuleModalWeekRangeSelector: React.FC<CustomModuleModalWeekRangeSelectorProps> = ({
  defaultWeekRange,
  onChange,
  error,
}) => {
  const [weekRange, setWeekRange] = useState<WeekRange>(defaultWeekRange);
  const [displayedInterval, setDisplayedInterval] = useState<string>(
    defaultWeekRange.weekInterval?.toString() ?? '1',
  );

  const updateParent = useCallback(() => {
    onChange(weekRange);
  }, [weekRange, onChange]);

  useEffect(() => {
    updateParent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekRange]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <DateField
          defaultDate={parseISO(weekRange.start)}
          onChange={(date) => {
            setWeekRange({ ...weekRange, start: date.toISOString() });
          }}
        />
        <p>to</p>
        <DateField
          defaultDate={parseISO(weekRange.end)}
          onChange={(date) => {
            setWeekRange({ ...weekRange, end: date.toISOString() });
          }}
        />
        <p>every</p>
        <div className={classNames(styles.column, styles.intervalInput)}>
          <input
            // Set the default empty string to show 1 week interval
            onBlur={() => {
              if (weekRange.weekInterval === undefined) setDisplayedInterval('1');
            }}
            onChange={(e) => {
              if (e.target.value.length === 0) {
                setWeekRange({ ...weekRange, weekInterval: undefined });
                setDisplayedInterval('');
              } else if (/^\d+$/.test(e.target.value)) {
                const value = parseInt(e.target.value, 10);
                setDisplayedInterval(e.target.value);
                setWeekRange({ ...weekRange, weekInterval: value === 1 ? undefined : value });
              }
            }}
            className="form-control"
            value={displayedInterval}
            required
          />
        </div>
        <p>week(s)</p>
      </div>

      <small className={styles.errorLabel}>{error ?? ''}</small>
    </div>
  );
};

export default CustomModuleModalWeekRangeSelector;
