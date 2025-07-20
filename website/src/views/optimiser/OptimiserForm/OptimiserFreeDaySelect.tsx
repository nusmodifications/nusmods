import classNames from 'classnames';
import { dropRight, omit } from 'lodash';
import { useCallback } from 'react';
import { DayText, WorkingDays } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';

import { CheckSquare, Square } from 'react-feather';
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
      setFreeDays((prev) => {
        const isSelected = prev.has(day);
        return new Set(
          isSelected ? [...prev].filter((existing) => existing !== day) : [...prev, day],
        );
      });
    },
    [setFreeDays],
  );

  return (
    <section className={styles.freeDaysSection}>
      <h4 className={styles.optimiserDescription}>
        Select days you would like to be free
        <OptimiserFormTooltip content="Chosen days will have no physical classes" />
      </h4>

      <div className={styles.freeDaysButtons}>
        {days.map((day) => {
          const checked = freeDays.has(day);

          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={checked}
              tabIndex={0}
              key={day}
              className={classNames(styles.freeDaysButton, { active: checked })}
              onClick={() => toggleDay(day)}
            >
              {checked ? <CheckSquare /> : <Square />}
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default OptimiserFreeDaySelect;
