import classNames from 'classnames';
import { dropRight } from 'lodash';
import { useCallback } from 'react';
import { DayText, WorkingDays } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';

import styles from './OptimiserFreeDaySelect.scss';
import OptimiserFormTooltip from './OptimiserFormTooltip';

type Props = {
  hasSaturday: boolean;
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserFreeDaySelect: React.FC<Props> = ({ hasSaturday, optimiserFormFields }) => {
  const { freeDays, setFreeDays } = optimiserFormFields;
  const days = hasSaturday ? [...WorkingDays] : dropRight([...WorkingDays], 1);

  const toggleDay = useCallback(
    (day: DayText) => {
      const isSelected = freeDays.has(day);
      setFreeDays(
        (prev) =>
          new Set(isSelected ? [...prev].filter((existing) => existing !== day) : [...prev, day]),
      );
    },
    [freeDays, setFreeDays],
  );

  return (
    <section className={styles.freeDaysSection}>
      <span className={styles.optimiserDescription}>
        <h4>Select days you would like to be free</h4>
        <OptimiserFormTooltip content="Chosen days will have no physical classes" />
      </span>

      <div className={styles.freeDaysButtons}>
        {days.map((day) => (
          <button
            key={day}
            type="button"
            className={classNames(styles.freeDaysButton, { active: freeDays.has(day) })}
            onClick={() => toggleDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </section>
  );
};

export default OptimiserFreeDaySelect;
